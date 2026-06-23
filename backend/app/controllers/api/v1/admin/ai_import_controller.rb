# frozen_string_literal: true

module Api
  module V1
    module Admin
      class AiImportController < BaseController
        def extract
          results = case params[:input_type]
          when "url"
                      raise "URLを入力してください" if params[:url].blank?
                      AiEventExtractorService.from_url(params[:url].strip)
          when "text"
                      raise "テキストを入力してください" if params[:text].blank?
                      AiEventExtractorService.from_text(params[:text])
          when "image"
                      raise "画像データがありません" if params[:image_data].blank?
                      AiEventExtractorService.from_image(params[:image_data], params[:mime_type] || "image/jpeg")
          when "pdf"
                      raise "PDFデータがありません" if params[:pdf_data].blank?
                      AiEventExtractorService.from_pdf(params[:pdf_data])
          else
                      raise "入力タイプが不正です（url / text / image / pdf のいずれかを指定してください）"
          end

          render json: { events: results }
        rescue => e
          render json: { error: e.message }, status: :unprocessable_entity
        end
      end
    end
  end
end
