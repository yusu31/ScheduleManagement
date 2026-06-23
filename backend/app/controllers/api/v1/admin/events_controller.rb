# frozen_string_literal: true

module Api
  module V1
    module Admin
      class EventsController < Admin::BaseController
        before_action :set_event, only: %i[show update destroy]

        def index
          events = Event.all
          events = events.where(status: params[:status]) if params[:status].present?
          events = events.order(created_at: :desc)
          render json: events.map { |e| event_json(e) }
        end

        def show
          render json: event_json(@event)
        end

        def create
          event = Event.new(event_params)
          event.source = "manual"
          event.status = "published"
          if event.save
            render json: event_json(event), status: :created
          else
            render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @event.update(event_params)
            render json: event_json(@event)
          else
            render json: { errors: @event.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @event.destroy
          head :no_content
        end

        def approve
          event = Event.find(params[:id])
          event.update!(status: "published")
          render json: event_json(event)
        end

        def reject
          event = Event.find(params[:id])
          event.destroy
          head :no_content
        end

        private

        def set_event
          @event = Event.find(params[:id])
        end

        def event_params
          params.require(:event).permit(
            :title, :description, :location, :area, :category,
            :start_at, :end_at, :capacity, :event_url, :image_url,
            :status, tags: []
          )
        end

        def event_json(event)
          event.as_json.merge("pending" => event.status == "pending")
        end
      end
    end
  end
end
