class AddLocationAndUrlToPersonalEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :personal_events, :location, :string
    add_column :personal_events, :url, :string
  end
end
