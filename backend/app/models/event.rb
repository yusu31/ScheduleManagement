# frozen_string_literal: true

class Event < ApplicationRecord
  AREAS = (MunicipalityDetectorService::MUNICIPALITIES + %w[オンライン]).freeze

  CATEGORIES = %w[
    スポーツ 音楽 アート 食・グルメ 自然・アウトドア 文化・伝統 ファミリー
    テクノロジー 教育 祭り・イベント その他
  ].freeze

  TAGS = %w[子連れOK 無料 屋外 室内].freeze
  STATUSES = %w[published pending].freeze
  SOURCES = %w[connpass rss manual].freeze

  attribute :tags, :json, default: []

  has_many :favorites, dependent: :destroy
  has_many :schedules, dependent: :destroy
  has_many :visit_records, dependent: :destroy

  scope :published, -> { where(status: "published") }
  scope :pending,   -> { where(status: "pending") }

  validates :title, presence: true
  validates :area, presence: true, inclusion: { in: AREAS }
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :start_at, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :connpass_id, uniqueness: true, allow_nil: true
end
