class CreateRegionConquests < ActiveRecord::Migration[7.2]
  def change
    create_table :region_conquests do |t|
      t.references :user, null: false, foreign_key: true
      t.string :region_id, null: false
      t.datetime :conquered_at, null: false
      t.timestamps
    end
    add_index :region_conquests, [:user_id, :region_id], unique: true
  end
end
