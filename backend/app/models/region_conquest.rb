class RegionConquest < ApplicationRecord
  VALID_REGION_IDS = %w[kenpo koriyama sukagawa kennan aizu okuaizu minamiaizu soma futaba iwaki all].freeze

  belongs_to :user
  validates :region_id, inclusion: { in: VALID_REGION_IDS }
  validates :region_id, uniqueness: { scope: :user_id }
  validates :conquered_at, presence: true
end
