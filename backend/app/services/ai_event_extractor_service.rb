# frozen_string_literal: true

require "net/http"
require "uri"
require "json"
require "base64"
require "stringio"

class AiEventExtractorService
  GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

  AREAS = %w[郡山市 福島市 いわき市 白河市 須賀川市 喜多方市 相馬市 二本松市 田村市 南相馬市 伊達市 本宮市 その他].freeze
  CATEGORIES = [ "スポーツ", "音楽", "アート", "食・グルメ", "自然・アウトドア", "文化・伝統", "ファミリー", "テクノロジー", "教育", "祭り・イベント", "その他" ].freeze

  def self.from_url(url)
    html = fetch_html(url)
    doc = Nokogiri::HTML(html)

    og_image = doc.at('meta[property="og:image"]')&.attr("content")
    page_text = extract_text(doc)

    results = call_gemini(text: "以下はWebページの本文です。含まれるイベント情報を全て抽出してください。\nページURL: #{url}\n\n#{page_text}")
    results.map do |event|
      event[:image_url] = og_image if og_image.present? && event[:image_url].blank?
      event[:event_url] = url if event[:event_url].blank?
      event
    end
  end

  def self.from_text(text)
    call_gemini(text: text)
  end

  def self.from_image(base64_data, mime_type)
    call_gemini_with_image(base64_data: base64_data, mime_type: mime_type)
  end

  def self.from_pdf(base64_data)
    pdf_binary = Base64.decode64(base64_data)
    reader = PDF::Reader.new(StringIO.new(pdf_binary))
    text = reader.pages.map(&:text).join("\n")
    call_gemini(text: "以下はPDFから抽出したテキストです。含まれるイベント情報を全て抽出してください。\n\n#{text}")
  rescue => e
    raise "PDFの読み込みに失敗しました: #{e.message}"
  end

  private

  def self.fetch_html(url)
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.open_timeout = 10
    http.read_timeout = 10
    request = Net::HTTP::Get.new(uri.request_uri, {
      "User-Agent" => "Mozilla/5.0 (compatible; RoamiBot/1.0)",
      "Accept-Language" => "ja"
    })
    response = http.request(request)
    response.body.force_encoding("UTF-8")
  rescue => e
    raise "URLの取得に失敗しました: #{e.message}"
  end

  def self.extract_text(doc)
    doc.search("script, style, nav, footer, header").remove
    doc.text.gsub(/\s+/, " ").strip.slice(0, 5000)
  end

  def self.call_gemini(text:)
    prompt = build_prompt(text)
    body = {
      contents: [ {
        parts: [ { text: prompt } ]
      } ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    }
    response = gemini_request(body)
    parse_response(response)
  end

  def self.call_gemini_with_image(base64_data:, mime_type:)
    prompt = build_prompt("この画像に含まれるイベント情報を全て抽出してください。")
    body = {
      contents: [ {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mime_type,
              data: base64_data
            }
          }
        ]
      } ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    }
    response = gemini_request(body)
    parse_response(response)
  end

  def self.build_prompt(input_text)
    areas = AREAS.join("、")
    categories = CATEGORIES.join("、")

    <<~PROMPT
      あなたはイベント情報抽出の専門家です。
      以下のテキスト（または画像）に含まれるイベント情報を全て抽出し、JSON配列形式で返してください。
      イベントが1件の場合も必ず配列（要素1つ）で返してください。
      イベント情報が見つからない場合は空の配列 [] を返してください。

      入力:
      #{input_text}

      以下のJSON配列形式で返してください（不明な項目はnull）:
      [
        {
          "title": "イベントタイトル",
          "description": "説明文（300文字程度）",
          "location": "会場名・住所",
          "area": "#{areas} のいずれか（福島県外または不明の場合は「その他」）",
          "category": "#{categories} のいずれか",
          "start_at": "ISO8601形式（例: 2026-07-15T10:00:00+09:00）またはnull",
          "end_at": "ISO8601形式またはnull",
          "event_url": "イベントページURLまたはnull",
          "image_url": "画像URLまたはnull"
        }
      ]
    PROMPT
  end

  def self.gemini_request(body)
    api_key = ENV["GEMINI_API_KEY"]
    raise "GEMINI_API_KEY が設定されていません。backend/.env ファイルにキーを追加してください。" if api_key.blank?

    uri = URI("#{GEMINI_API_URL}?key=#{api_key}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 60
    http.read_timeout = 60

    request = Net::HTTP::Post.new(uri.request_uri, { "Content-Type" => "application/json" })
    request.body = body.to_json

    response = http.request(request)
    JSON.parse(response.body)
  rescue => e
    raise "Gemini API リクエストに失敗しました: #{e.message}"
  end

  def self.parse_response(response)
    text = response.dig("candidates", 0, "content", "parts", 0, "text")
    raise "Gemini API からのレスポンスが不正です: #{response.inspect}" if text.nil?

    data = JSON.parse(text)
    events = data.is_a?(Array) ? data : [ data ]

    events.map do |event|
      {
        title: event["title"],
        description: event["description"],
        location: event["location"],
        area: AREAS.include?(event["area"]) ? event["area"] : "その他",
        category: CATEGORIES.include?(event["category"]) ? event["category"] : "その他",
        start_at: event["start_at"],
        end_at: event["end_at"],
        event_url: event["event_url"],
        image_url: event["image_url"]
      }
    end
  rescue JSON::ParserError => e
    raise "Gemini API のレスポンスの解析に失敗しました: #{e.message}"
  end
end
