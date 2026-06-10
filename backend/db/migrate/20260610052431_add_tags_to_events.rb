class AddTagsToEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :events, :tags, :json
  end
end
