# frozen_string_literal: true

module Api
  module V1
    class RegistrationsController < DeviseTokenAuth::RegistrationsController
      private

      def sign_up_params
        params.permit(:email, :password, :password_confirmation, :name)
      end

      def account_update_params
        params.permit(:name, :password, :password_confirmation, :current_password)
      end
    end
  end
end
