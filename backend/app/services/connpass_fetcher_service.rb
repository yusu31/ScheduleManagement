# frozen_string_literal: true

class ConnpassFetcherService
  API_URL = "https://connpass.com/api/v1/event/"
  KEYWORDS = %w[福島].freeze
  FETCH_COUNT = 100

  AREA_KEYWORDS = {
    "郡山市" => %w[郡山],
    "福島市" => %w[福島市 福島駅],
    "いわき市" => %w[いわき],
    "白河市" => %w[白河],
    "須賀川市" => %w[須賀川],
    "喜多方市" => %w[喜多方],
    "相馬市" => %w[相馬],
    "二本松市" => %w[二本松],
    "田村市" => %w[田村],
    "南相馬市" => %w[南相馬],
    "伊達市" => %w[伊達],
    "本宮市" => %w[本宮]
  }.freeze

  CATEGORY_KEYWORDS = {
    "テクノロジー" => %w[エンジニア プログラミング IT tech 開発 Ruby Python JavaScript],
    "音楽" => %w[音楽 ライブ コンサート],
    "アート" => %w[アート 展示 美術 写真],
    "食・グルメ" => %w[グルメ 食 料理 カフェ],
    "自然・アウトドア" => %w[ハイキング 登山 自然 アウトドア],
    "文化・伝統" => %w[伝統 文化 歴史 祭],
    "スポーツ" => %w[スポーツ マラソン サッカー 野球],
    "ファミリー" => %w[子ども 子供 ファミリー 家族 親子],
    "教育" => %w[勉強会 セミナー 講座 ワークショップ 学習]
  }.freeze

  TAG_RULES = {
    "子連れOK" => %w[子ども 子供 ファミリー 家族 親子 キッズ],
    "無料" => %w[無料 free],
    "屋外" => %w[公園 野外 屋外 アウトドア キャンプ]
  }.freeze

  def call
    saved_count = 0
    skipped_count = 0

    KEYWORDS.each do |keyword|
      events_data = fetch_events(keyword)
      events_data.each do |data|
        if save_event(data)
          saved_count += 1
        else
          skipped_count += 1
        end
      end
    end

    { saved: saved_count, skipped: skipped_count }
  end

  private

  def fetch_events(keyword)
    conn = Faraday.new do |f|
      f.headers["User-Agent"] = "FukushimaEventNavi/1.0"
    end
    response = conn.get(API_URL, keyword: keyword, count: FETCH_COUNT)

    unless response.success?
      Rails.logger.error("Connpass API returned #{response.status}")
      return []
    end

    JSON.parse(response.body)["events"] || []
  rescue Faraday::Error => e
    Rails.logger.error("Connpass API error: #{e.message}")
    []
  end

  def save_event(data)
    event = Event.find_or_initialize_by(connpass_id: data["event_id"])
    return false unless event.new_record?

    category = category_from(data)
    event.assign_attributes(
      title: data["title"],
      description: data["catch"].presence || data["description"],
      location: data["place"],
      area: area_from(data),
      category: category,
      start_at: data["started_at"],
      end_at: data["ended_at"],
      capacity: data["limit"],
      event_url: data["event_url"],
      image_url: data["image_url"],
      source: "connpass",
      tags: tags_from(data, category)
    )
    event.save
  end

  def area_from(data)
    text = [ data["place"], data["address"] ].compact.join(" ")
    AREA_KEYWORDS.each do |area, keywords|
      return area if keywords.any? { |kw| text.include?(kw) }
    end
    "その他"
  end

  def category_from(data)
    text = [ data["title"], data["catch"] ].compact.join(" ")
    CATEGORY_KEYWORDS.each do |category, keywords|
      return category if keywords.any? { |kw| text.include?(kw) }
    end
    "テクノロジー"
  end

  def tags_from(data, category)
    text = [ data["title"], data["catch"], data["description"] ].compact.join(" ")
    tags = []

    TAG_RULES.each do |tag, keywords|
      tags << tag if keywords.any? { |kw| text.downcase.include?(kw.downcase) }
    end
    tags << "子連れOK" if category == "ファミリー" && !tags.include?("子連れOK")
    tags << (tags.include?("屋外") ? nil : "室内")
    tags.compact.uniq
  end
end
