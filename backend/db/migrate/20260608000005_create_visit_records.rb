# frozen_string_literal: true

class CreateVisitRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :visit_records do |t|
      t.references :user,  null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.string   :municipality,    null: false, limit: 100
      t.string   :companion_type,  null: false, limit: 20
      t.string   :photo_url
      t.datetime :visited_at,      null: false

      t.timestamps
    end

    add_index :visit_records, %i[user_id municipality]
  end
end
