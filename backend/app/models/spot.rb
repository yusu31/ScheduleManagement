# frozen_string_literal: true

class Spot < ApplicationRecord
  AREAS = %w[県北 県中 県南 会津 南会津 いわき 相双].freeze

  CATEGORIES = %w[自然 歴史・文化 温泉 テーマパーク 体験・アクティビティ 道の駅 その他].freeze

  SEASONS = %w[spring summer autumn winter all].freeze

  STATUSES = %w[published draft].freeze

  SOURCES = %w[manual imported].freeze

  scope :published, -> { where(status: "published") }

  validates :name,         presence: true
  validates :area,         presence: true, inclusion: { in: AREAS }
  validates :municipality, presence: true, inclusion: { in: MunicipalityDetectorService::MUNICIPALITIES }
  validates :category,     presence: true, inclusion: { in: CATEGORIES }
  validates :season,       inclusion: { in: SEASONS }, allow_nil: true
  validates :status,       inclusion: { in: STATUSES }
  validates :source,       inclusion: { in: SOURCES }
end
