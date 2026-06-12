class AddMunicipalityToPersonalEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :personal_events, :municipality, :string
  end
end
