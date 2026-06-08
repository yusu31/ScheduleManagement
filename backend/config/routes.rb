Rails.application.routes.draw do
  mount_devise_token_auth_for "User", at: "auth"

  namespace :api do
    namespace :v1 do
      # イベント・その他APIエンドポイントはここに追加
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
