# frozen_string_literal: true

class User < ApplicationRecord
  # devise を include より先に呼ぶことで DeviseTokenAuth::Concerns::User が
  # :confirmable を自動追加するのを防ぐ（includeタイミングで devise_modules が
  # 未定義だと Concern が confirmable 含む全モジュールを上書き追加してしまう）
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  include DeviseTokenAuth::Concerns::User

  # :validatable のemail format検証を上書き（任意の文字列を許可する）
  validates :email, presence: true, uniqueness: { case_sensitive: false }

  has_many :favorites, dependent: :destroy
  has_many :schedules, dependent: :destroy
  has_many :visit_records, dependent: :destroy
  has_many :region_conquests, dependent: :destroy
  has_many :personal_events, dependent: :destroy
  has_many :favorite_events, through: :favorites, source: :event
  has_many :scheduled_events, through: :schedules, source: :event
end
