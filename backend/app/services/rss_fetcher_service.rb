# frozen_string_literal: true

class RssFetcherService
  RSS_FEEDS = [
    { url: "https://www.f-kankou.jp/event/feed",                        area: "福島市",   name: "福島市観光ノート" },
    { url: "http://www.nihonmatsu-kanko.jp/?feed=rss2",                 area: "二本松市", name: "二本松市観光連盟" },
    { url: "https://mazasse.com/rss",                                   area: "郡山市",   name: "まざっせプラザ" },
    { url: "http://miharukoma.com/feed",                                area: "その他",   name: "Find三春" },
    { url: "http://gokujo-aizu.com/eventinfo/feed",                     area: "その他",   name: "極上の会津" },
    { url: "https://aizu-yanaizu.com/infomation/feed/",                 area: "その他",   name: "柳津観光協会" },
    { url: "http://misatono.jp/category/blog/feed",                     area: "その他",   name: "会津美里町" },
    { url: "https://minamisomakanko.org/feed",                          area: "南相馬市", name: "南相馬観光協会" },
    { url: "https://iwaki.goguynet.jp/category/cat_event/feed",         area: "いわき市", name: "号外NETいわき" },
    { url: "https://koriyama.goguynet.jp/category/cat_event/feed",      area: "郡山市",   name: "号外NET郡山" },
    { url: "https://aizu.goguynet.jp/category/cat_event/feed",          area: "その他",   name: "号外NET会津若松" }
  ].freeze

  CATEGORY_KEYWORDS = {
    "祭り・イベント"  => %w[祭り 祭 フェスティバル フェス 花火 縁日 夏まつり 冬まつり 盆踊り],
    "スポーツ"       => %w[スポーツ マラソン ランニング サッカー 野球 テニス 水泳 剣道 柔道],
    "音楽"          => %w[音楽 ライブ コンサート 演奏 バンド 合唱],
    "アート"         => %w[アート 展示 美術 写真 ギャラリー 絵画 工芸],
    "食・グルメ"     => %w[グルメ 食 料理 カフェ レストラン フード 酒 ビール 食べ歩き],
    "自然・アウトドア" => %w[ハイキング 登山 自然 アウトドア キャンプ トレッキング 山 川 湖],
    "文化・伝統"     => %w[伝統 文化 歴史 茶道 華道 着物 古典 民謡],
    "ファミリー"     => %w[子ども 子供 ファミリー 家族 親子 キッズ 幼児],
    "教育"          => %w[勉強会 セミナー 講座 ワークショップ 学習 講演 体験],
    "テクノロジー"   => %w[エンジニア プログラミング IT tech 開発 DX]
  }.freeze

  TAG_RULES = {
    "子連れOK" => %w[子ども 子供 ファミリー 家族 親子 キッズ 幼児],
    "無料"     => %w[無料 入場無料 参加無料 観覧無料],
    "屋外"     => %w[公園 野外 屋外 アウトドア 広場 河川敷 山]
  }.freeze

  def call
    total = { saved: 0, skipped: 0, errors: 0 }

    RSS_FEEDS.each do |feed|
      result = fetch_and_save(feed)
      total[:saved]   += result[:saved]
      total[:skipped] += result[:skipped]
      total[:errors]  += result[:errors]
      Rails.logger.info("RSS [#{feed[:name]}] saved=#{result[:saved]} skipped=#{result[:skipped]}")
    end

    total
  end

  private

  def fetch_and_save(feed)
    saved = 0
    skipped = 0

    items = parse_rss(feed[:url])
    items.each do |item|
      url = item[:link].to_s.strip
      next if url.blank?

      if Event.exists?(event_url: url)
        skipped += 1
        next
      end

      pub_date = item[:pub_date]
      next if pub_date && pub_date < 60.days.ago

      start_at = extract_date_from_text(item[:title].to_s + " " + item[:description].to_s) ||
                 pub_date ||
                 Time.current

      title = item[:title].to_s.strip
      next if title.blank?

      text = "#{title} #{item[:description]}"
      event = Event.new(
        title:       title,
        description: item[:description].presence,
        event_url:   url,
        area:        feed[:area],
        category:    category_from(text),
        start_at:    start_at,
        status:      "pending",
        source:      "rss",
        tags:        tags_from(text)
      )

      if event.save
        saved += 1
      else
        Rails.logger.warn("RSS save failed [#{feed[:name]}] #{title}: #{event.errors.full_messages}")
        skipped += 1
      end
    end

    { saved: saved, skipped: skipped, errors: 0 }
  rescue => e
    Rails.logger.error("RSS fetch error [#{feed[:name]}]: #{e.message}")
    { saved: 0, skipped: 0, errors: 1 }
  end

  def parse_rss(url)
    conn = Faraday.new do |f|
      f.headers["User-Agent"] = "Roami/1.0"
      f.options.timeout = 15
    end
    response = conn.get(url)
    return [] unless response.success?

    doc = Nokogiri::XML(response.body)
    doc.remove_namespaces!

    nodes = doc.xpath("//item")
    nodes = doc.xpath("//entry") if nodes.empty?

    nodes.map do |node|
      link = node.at_xpath("link")&.text&.strip
      link = node.at_xpath("link/@href")&.value&.strip if link.blank?

      raw_desc = node.at_xpath("description")&.text ||
                 node.at_xpath("summary")&.text ||
                 node.at_xpath("content")&.text || ""

      date_text = node.at_xpath("pubDate")&.text ||
                  node.at_xpath("updated")&.text ||
                  node.at_xpath("published")&.text ||
                  node.at_xpath("date")&.text

      {
        title:       node.at_xpath("title")&.text&.strip,
        link:        link,
        description: strip_html(raw_desc),
        pub_date:    parse_time(date_text)
      }
    end
  rescue Faraday::Error => e
    Rails.logger.error("RSS connection error [#{url}]: #{e.message}")
    []
  end

  def strip_html(html)
    html.gsub(/<[^>]+>/, " ").gsub(/&amp;/, "&").gsub(/&lt;/, "<").gsub(/&gt;/, ">").gsub(/&nbsp;/, " ").gsub(/\s+/, " ").strip
  end

  def parse_time(str)
    Time.parse(str) rescue nil
  end

  def extract_date_from_text(text)
    year = Time.current.year

    if text =~ /(\d{4})年(\d{1,2})月(\d{1,2})日/
      date = Date.new($1.to_i, $2.to_i, $3.to_i) rescue nil
      return date.to_time if date && date >= Date.today - 1
    end

    if text =~ /(\d{1,2})月(\d{1,2})日/
      month = $1.to_i
      day   = $2.to_i
      date  = Date.new(year, month, day) rescue nil
      date  = Date.new(year + 1, month, day) rescue nil if date.nil? || date < Date.today - 1
      return date.to_time if date && date >= Date.today - 1
    end

    nil
  end

  def category_from(text)
    CATEGORY_KEYWORDS.each do |category, keywords|
      return category if keywords.any? { |kw| text.include?(kw) }
    end
    "祭り・イベント"
  end

  def tags_from(text)
    tags = []
    TAG_RULES.each do |tag, keywords|
      tags << tag if keywords.any? { |kw| text.include?(kw) }
    end
    tags << "室内" unless tags.include?("屋外")
    tags.uniq
  end
end
