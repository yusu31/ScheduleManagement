# frozen_string_literal: true

module Api
  module V1
    module Admin
      class RestaurantsController < Admin::BaseController
        before_action :set_restaurant, only: %i[show update destroy]

        def index
          restaurants = Restaurant.all
          restaurants = restaurants.where(status: params[:status])   if params[:status].present?
          restaurants = restaurants.by_area(params[:area])           if params[:area].present?
          restaurants = restaurants.by_category(params[:category])   if params[:category].present?
          restaurants = restaurants.order(created_at: :desc)
          render json: restaurants
        end

        def show
          render json: @restaurant
        end

        def create
          restaurant = Restaurant.new(restaurant_params)
          if restaurant.save
            render json: restaurant, status: :created
          else
            render json: { errors: restaurant.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @restaurant.update(restaurant_params)
            render json: @restaurant
          else
            render json: { errors: @restaurant.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @restaurant.destroy
          head :no_content
        end

        private

        def set_restaurant
          @restaurant = Restaurant.find(params[:id])
        end

        def restaurant_params
          params.require(:restaurant).permit(
            :name, :description, :area, :municipality, :address,
            :category, :genre, :latitude, :longitude,
            :image_url, :official_url, :phone, :opening_hours,
            :budget, :hotpepper_id, :source, :status
          )
        end
      end
    end
  end
end
