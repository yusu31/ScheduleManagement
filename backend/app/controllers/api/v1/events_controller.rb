# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      def index
        events = Event.published
        events = events.where(area: params[:area])         if params[:area].present?
        events = events.where(category: params[:category]) if params[:category].present?
        events = events.where("start_at >= ?", params[:start_date]) if params[:start_date].present?
        events = events.where("start_at <= ?", params[:end_date])   if params[:end_date].present?
        events = events.order(params[:sort] == "start_desc" ? { start_at: :desc } : { start_at: :asc })
        render json: events
      end

      def show
        event = Event.published.find(params[:id])
        render json: event
      end
    end
  end
end
