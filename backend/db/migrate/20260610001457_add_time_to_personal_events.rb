class AddTimeToPersonalEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :personal_events, :start_time, :time
    add_column :personal_events, :end_time, :time
  end
end
