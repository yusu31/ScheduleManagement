# frozen_string_literal: true

class CreateSpots < ActiveRecord::Migration[7.2]
  def change
    create_table :spots do |t|
      t.string   :name,          null: false
      t.text     :description
      t.string   :area,          null: false
      t.string   :municipality
      t.string   :address
      t.string   :category,      null: false
      t.string   :season,        default: "all"
      t.decimal  :latitude,      precision: 10, scale: 7
      t.decimal  :longitude,     precision: 10, scale: 7
      t.string   :image_url,     limit: 500
      t.string   :official_url,  limit: 500
      t.string   :phone
      t.string   :opening_hours
      t.string   :access
      t.string   :admission_fee
      t.string   :source,        default: "manual"
      t.string   :status,        default: "published"

      t.timestamps
    end

    add_index :spots, :area
    add_index :spots, :category
    add_index :spots, :season
    add_index :spots, :status
  end
end
