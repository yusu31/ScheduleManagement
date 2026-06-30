# frozen_string_literal: true

module Api
  module V1
    class RestaurantsController < ApplicationController
      def index
        restaurants = Restaurant.published
        restaurants = restaurants.by_area(params[:area])                       if params[:area].present?
        restaurants = restaurants.where(municipality: params[:municipalities]) if params[:municipalities].present?
        restaurants = restaurants.by_category(params[:category])               if params[:category].present?
        if params[:q].present?
          keyword = "%#{params[:q]}%"
          restaurants = restaurants.where("name LIKE ? OR description LIKE ? OR address LIKE ?", keyword, keyword, keyword)
        end
        restaurants = restaurants.order(created_at: :desc)
        render json: restaurants
      end

      def show
        restaurant = Restaurant.published.find(params[:id])
        render json: restaurant
      end
    end
  end
end
