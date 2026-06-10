# frozen_string_literal: true

class PersonalEvent < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :event_date, presence: true

  def as_json(options = {})
    super(options).tap do |hash|
      hash["start_time"] = start_time&.strftime("%H:%M")
      hash["end_time"]   = end_time&.strftime("%H:%M")
    end
  end
end
