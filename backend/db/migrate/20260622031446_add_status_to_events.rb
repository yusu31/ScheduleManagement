class AddStatusToEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :events, :status, :string, default: 'published', null: false
    add_index :events, :status
  end
end
