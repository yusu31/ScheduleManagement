# frozen_string_literal: true

module Api
  module V1
    class SpotsController < ApplicationController
      def index
        spots = Spot.published
        spots = spots.where(area: params[:area])                 if params[:area].present?
        spots = spots.where(municipality: params[:municipalities]) if params[:municipalities].present?
        spots = spots.where(category: params[:category])         if params[:category].present?
        spots = spots.where(season: params[:season])             if params[:season].present?
        if params[:q].present?
          keyword = "%#{params[:q]}%"
          spots = spots.where("name LIKE ? OR description LIKE ?", keyword, keyword)
        end
        spots = spots.order(created_at: :desc)
        render json: spots
      end

      def show
        spot = Spot.published.find(params[:id])
        render json: spot
      end
    end
  end
end
