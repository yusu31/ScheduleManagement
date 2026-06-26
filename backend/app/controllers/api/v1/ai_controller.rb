# frozen_string_literal: true

module Api
  module V1
    class AiController < ApplicationController
      def chat
        message = params[:message].to_s.strip
        return render json: { error: "メッセージを入力してください" }, status: :bad_request if message.blank?

        reply = GeminiService.chat(message)
        render json: { reply: reply }
      rescue => e
        Rails.logger.error "GeminiService error: #{e.message}"
        render json: { error: "AIとの通信に失敗しました。しばらくしてから再試行してください。" }, status: :internal_server_error
      end
    end
  end
end
