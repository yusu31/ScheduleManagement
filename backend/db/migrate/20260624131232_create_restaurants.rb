# frozen_string_literal: true

class CreateRestaurants < ActiveRecord::Migration[7.2]
  def change
    create_table :restaurants do |t|
      t.string  :name,         null: false
      t.text    :description
      t.string  :area,         null: false
      t.string  :municipality
      t.string  :address
      t.string  :category,     null: false
      t.string  :genre
      t.decimal :latitude,  precision: 10, scale: 7
      t.decimal :longitude, precision: 10, scale: 7
      t.string  :image_url,    limit: 500
      t.string  :official_url, limit: 500
      t.string  :phone
      t.string  :opening_hours
      t.string  :budget
      t.string  :hotpepper_id
      t.string  :source,  default: "manual"
      t.string  :status,  default: "published", null: false

      t.timestamps
    end

    add_index :restaurants, :area
    add_index :restaurants, :category
    add_index :restaurants, :status
    add_index :restaurants, :hotpepper_id, unique: true
  end
end
