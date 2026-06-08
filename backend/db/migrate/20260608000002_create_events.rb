# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :events do |t|
      t.string   :title,       null: false
      t.text     :description
      t.string   :location
      t.string   :area,        null: false, limit: 50
      t.string   :category,    null: false, limit: 50
      t.datetime :start_at,    null: false
      t.datetime :end_at
      t.integer  :capacity
      t.string   :event_url
      t.string   :image_url
      t.string   :source,      null: false, default: "connpass", limit: 20
      t.integer  :connpass_id

      t.timestamps
    end

    add_index :events, :start_at
    add_index :events, :area
    add_index :events, :category
    add_index :events, :connpass_id, unique: true
  end
end
