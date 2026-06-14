# frozen_string_literal: true

DeviseTokenAuth.setup do |config|
  # ヘッダートークンをリクエストごとに更新しない（フロントエンド実装を簡略化するため）
  config.change_headers_on_each_request = false
  config.token_lifespan = 2.weeks
  config.batch_request_buffer_throttle = 5.seconds
  # Rails API モードではセッションが無効なため bypass_sign_in を無効化
  config.bypass_sign_in = false
  config.default_confirm_success_url = nil
  # UserOmniauthCallbacks Concern のデフォルトコールバックを無効化し
  # email形式バリデーション（is not an email）を外す
  config.default_callbacks = false
end
