# frozen_string_literal: true

require "net/http"
require "uri"
require "json"

class GeminiService
  GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

  def self.chat(message)
    events = upcoming_events
    spots  = published_spots

    body = {
      systemInstruction: {
        parts: [ { text: build_system_prompt(events, spots) } ]
      },
      contents: [ {
        role: "user",
        parts: [ { text: message } ]
      } ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512
      }
    }

    response = gemini_request(body)
    extract_reply(response)
  end

  private_class_method def self.upcoming_events
    Event.where(status: "published")
         .where(start_at: Time.current..30.days.from_now)
         .order(:start_at)
         .limit(50)
  end

  private_class_method def self.published_spots
    Spot.where(status: "published")
        .order(:name)
        .limit(30)
  end

  private_class_method def self.build_system_prompt(events, spots)
    events_text = events.map do |e|
      "- #{e.title}（#{e.area}・#{e.start_at&.strftime('%-m/%-d %H:%M')}）#{e.location.present? ? " @ #{e.location}" : ''}"
    end.join("\n")

    spots_text = spots.map do |s|
      "- #{s.name}（#{s.area}・#{s.category}）"
    end.join("\n")

    <<~PROMPT
      あなたは福島県のおでかけ・イベント情報アシスタント「Roami アシスタント」です。
      ユーザーが福島でのイベント・観光スポット・おでかけについて質問したとき、
      以下の情報をもとに丁寧・簡潔に日本語で答えてください。

      ## 今後30日以内の公開イベント
      #{events_text.presence || "現在登録されているイベントはありません。"}

      ## 公開中の観光スポット
      #{spots_text.presence || "現在登録されているスポットはありません。"}

      【回答ルール】
      - 回答は日本語で 200 文字以内を目安に簡潔にまとめること
      - 上記のデータにない情報は「現在情報がありません」と正直に伝えること
      - 特定のイベントやスポットを紹介するときは名前・場所・日時を具体的に示すこと
    PROMPT
  end

  private_class_method def self.gemini_request(body)
    api_key = ENV["GEMINI_API_KEY"]
    raise "GEMINI_API_KEY が設定されていません" if api_key.blank?

    uri = URI("#{GEMINI_API_URL}?key=#{api_key}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 30
    http.read_timeout = 30

    request = Net::HTTP::Post.new(uri.request_uri, { "Content-Type" => "application/json" })
    request.body = body.to_json

    response = http.request(request)
    JSON.parse(response.body)
  rescue => e
    raise "Gemini API リクエストに失敗しました: #{e.message}"
  end

  private_class_method def self.extract_reply(response)
    text = response.dig("candidates", 0, "content", "parts", 0, "text")
    raise "Gemini API からの応答が不正です: #{response.inspect}" if text.nil?

    text.strip
  end
end
