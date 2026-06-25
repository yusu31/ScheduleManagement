# frozen_string_literal: true

class AddSituationTagsToRestaurants < ActiveRecord::Migration[7.2]
  def change
    add_column :restaurants, :situation_tags, :json
  end
end
