# frozen_string_literal: true

class Restaurant < ApplicationRecord
  AREAS = %w[県北 県中 県南 会津 南会津 いわき 相双].freeze

  CATEGORIES = %w[和食 洋食 中華 イタリアン フレンチ 焼肉 寿司 ラーメン カフェ・スイーツ その他].freeze

  STATUSES = %w[published draft].freeze

  SOURCES = %w[manual hotpepper].freeze

  scope :published, -> { where(status: "published") }
  scope :by_area,     ->(area)     { where(area: area) }
  scope :by_category, ->(category) { where(category: category) }

  validates :name,     presence: true
  validates :area,     presence: true, inclusion: { in: AREAS }
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :status,   inclusion: { in: STATUSES }
  validates :source,   inclusion: { in: SOURCES }
  validates :hotpepper_id, uniqueness: true, allow_nil: true
end
