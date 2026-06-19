# frozen_string_literal: true

module Api
  module V1
    class UsersController < BaseController
      def stats
        render json: {
          visited_municipalities: current_user.visit_records.distinct.count(:municipality),
          favorites_count: current_user.favorites.count,
          personal_events_count: current_user.personal_events.count,
          conquered_regions_count: current_user.region_conquests.count
        }
      end
    end
  end
end
