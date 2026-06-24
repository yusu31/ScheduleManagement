# frozen_string_literal: true

module Api
  module V1
    module Admin
      class SpotsController < Admin::BaseController
        before_action :set_spot, only: %i[show update destroy]

        def index
          spots = Spot.all
          spots = spots.where(status: params[:status])   if params[:status].present?
          spots = spots.where(area: params[:area])       if params[:area].present?
          spots = spots.where(category: params[:category]) if params[:category].present?
          spots = spots.order(created_at: :desc)
          render json: spots
        end

        def show
          render json: @spot
        end

        def create
          spot = Spot.new(spot_params)
          if spot.save
            render json: spot, status: :created
          else
            render json: { errors: spot.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @spot.update(spot_params)
            render json: @spot
          else
            render json: { errors: @spot.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @spot.destroy
          head :no_content
        end

        private

        def set_spot
          @spot = Spot.find(params[:id])
        end

        def spot_params
          params.require(:spot).permit(
            :name, :description, :area, :municipality, :address,
            :category, :season, :latitude, :longitude,
            :image_url, :official_url, :phone, :opening_hours,
            :access, :admission_fee, :source, :status
          )
        end
      end
    end
  end
end
