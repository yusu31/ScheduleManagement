# frozen_string_literal: true

class Restaurant < ApplicationRecord
  AREAS = %w[県北 県中 県南 会津 南会津 いわき 相双].freeze

  CATEGORIES = %w[和食 ラーメン 寿司・海鮮 焼肉 カフェ・スイーツ ベーカリー イタリアン 中華 洋食 フレンチ カレー 居酒屋 その他].freeze

  STATUSES = %w[published draft].freeze

  SOURCES = %w[manual hotpepper].freeze

  SITUATION_TAGS = %w[子連れOK ランチ向け デートに ひとり飯OK 個室あり].freeze

  scope :published, -> { where(status: "published") }
  scope :by_area,     ->(area)     { where(area: area) }
  scope :by_category, ->(category) { where(category: category) }

  validates :name,     presence: true
  validates :area,     presence: true, inclusion: { in: AREAS }
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :status,   inclusion: { in: STATUSES }
  validates :source,   inclusion: { in: SOURCES }
  validates :hotpepper_id, uniqueness: true, allow_nil: true

  def situation_tags
    raw = super
    return [] if raw.nil?
    return raw if raw.is_a?(Array)
    JSON.parse(raw)
  rescue JSON::ParserError
    []
  end
end
