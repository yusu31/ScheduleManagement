# frozen_string_literal: true

require "net/http"
require "json"

class HotpepperFetcherService
  HOTPEPPER_API_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/"
  LARGE_AREA_CODE   = "X041"
  MAX_COUNT         = 100

  AREA_MAP = {
    "Z011" => "県北",
    "Z012" => "県中",
    "Z013" => "県南",
    "Z014" => "会津",
    "Z015" => "いわき",
    "Z016" => "相双"
  }.freeze

  GENRE_CATEGORY_MAP = {
    "G001" => "居酒屋",
    "G002" => "ダイニングバー",
    "G003" => "創作料理",
    "G004" => "和食",
    "G005" => "洋食",
    "G006" => "イタリアン",
    "G007" => "中華",
    "G008" => "焼肉",
    "G009" => "韓国料理",
    "G010" => "アジア・エスニック",
    "G011" => "各国料理",
    "G012" => "カラオケ",
    "G013" => "バー・カクテル",
    "G014" => "ラーメン",
    "G016" => "お好み焼き",
    "G017" => "海鮮",
    "G018" => "そば・うどん",
    "G019" => "フレンチ",
    "G020" => "カフェ・スイーツ",
    "G021" => "その他グルメ"
  }.freeze

  def self.call
    new.fetch_and_save
  end

  def fetch_and_save
    saved_count = 0
    start       = 1

    loop do
      shops = fetch_page(start)
      break if shops.empty?

      shops.each do |shop|
        upsert_restaurant(shop)
        saved_count += 1
      end

      break if shops.size < MAX_COUNT

      start += MAX_COUNT
    end

    saved_count
  end

  private

  def fetch_page(start)
    uri = URI(HOTPEPPER_API_URL)
    uri.query = URI.encode_www_form(
      key:        ENV.fetch("HOTPEPPER_API_KEY"),
      large_area: LARGE_AREA_CODE,
      count:      MAX_COUNT,
      start:      start,
      format:     "json"
    )

    response = Net::HTTP.get_response(uri)
    return [] unless response.is_a?(Net::HTTPSuccess)

    body = JSON.parse(response.body)
    body.dig("results", "shop") || []
  rescue StandardError => e
    Rails.logger.error("[HotpepperFetcherService] fetch error: #{e.message}")
    []
  end

  def upsert_restaurant(shop)
    genre_name = shop.dig("genre", "name") || "その他"
    category   = map_category(genre_name)

    Restaurant.find_or_initialize_by(hotpepper_id: shop["id"]).tap do |r|
      r.name         = shop["name"]
      r.address      = shop["address"]
      r.area         = map_area(shop["middle_area"]&.dig("code"))
      r.municipality = extract_municipality(shop["address"])
      r.category     = category
      r.genre        = genre_name
      r.phone        = shop["tel"]
      r.opening_hours = shop["open"]
      r.budget       = shop.dig("budget", "average")
      r.image_url    = shop.dig("photo", "mobile", "l")
      r.official_url = shop["urls"]&.dig("pc")
      r.latitude     = shop["lat"]
      r.longitude    = shop["lng"]
      r.source       = "hotpepper"
      r.status       = "published"
      r.save!
    end
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.warn("[HotpepperFetcherService] skip #{shop['id']}: #{e.message}")
  end

  def map_area(middle_area_code)
    AREA_MAP[middle_area_code] || "県中"
  end

  def map_category(genre_name)
    case genre_name
    when /和食|寿司|そば|うどん|海鮮/
      "和食"
    when /洋食/
      "洋食"
    when /中華/
      "中華"
    when /イタリアン/
      "イタリアン"
    when /フレンチ/
      "フレンチ"
    when /焼肉/
      "焼肉"
    when /ラーメン/
      "ラーメン"
    when /カフェ|スイーツ/
      "カフェ・スイーツ"
    else
      "その他"
    end
  end

  def extract_municipality(address)
    return nil if address.blank?

    address.scan(/福島県(.+?[市町村])/).flatten.first
  end
end
