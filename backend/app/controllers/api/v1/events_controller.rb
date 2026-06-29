# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      PER_PAGE_DEFAULT = 12
      PER_PAGE_MAX     = 48

      def index
        events = Event.published

        events = events.where(area:     params[:areas])      if params[:areas].present?
        events = events.where(category: params[:categories]) if params[:categories].present?
        events = events.where("start_at >= ?", params[:start_date]) if params[:start_date].present?
        events = events.where("start_at <= ?", params[:end_date])   if params[:end_date].present?

        if params[:q].present?
          q = "%#{sanitize_like(params[:q])}%"
          events = events.where("title LIKE ? OR description LIKE ? OR location LIKE ?", q, q, q)
        end

        if params[:tags].present?
          Array(params[:tags]).each do |tag|
            events = events.where("JSON_CONTAINS(tags, ?)", tag.to_json)
          end
        end

        if params[:show_past] == "true"
          events = events.where("start_at >= ?", 1.year.ago)
          events = events.order(Arel.sql(
            "CASE WHEN start_at >= NOW() THEN 0 ELSE 1 END ASC," \
            "CASE WHEN start_at >= NOW() THEN UNIX_TIMESTAMP(start_at) ELSE -UNIX_TIMESTAMP(start_at) END ASC"
          ))
        else
          events = events.where("start_at >= ?", Time.current).order(start_at: :asc)
        end

        raw_per = params[:per_page].to_i
        per_page    = raw_per.between?(1, PER_PAGE_MAX) ? raw_per : PER_PAGE_DEFAULT
        page        = [params[:page].to_i, 1].max
        total_count = events.count
        total_pages = total_count.zero? ? 1 : (total_count.to_f / per_page).ceil

        events = events.offset((page - 1) * per_page).limit(per_page)

        render json: {
          events: events,
          meta: {
            total_count:  total_count,
            total_pages:  total_pages,
            current_page: page,
            per_page:     per_page
          }
        }
      end

      def show
        event = Event.published.find(params[:id])
        render json: event
      end

      private

      def sanitize_like(str)
        str.gsub(/[%_\\]/) { |c| "\\#{c}" }
      end
    end
  end
end
