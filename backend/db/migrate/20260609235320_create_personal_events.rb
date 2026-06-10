class CreatePersonalEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :personal_events do |t|
      t.string :title, null: false
      t.text :memo
      t.date :event_date, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
