# frozen_string_literal: true

namespace :connpass do
  desc "ConnpassAPIから福島関連イベントを取得してDBに保存する"
  task fetch: :environment do
    puts "Connpassイベント取得を開始します..."
    result = ConnpassFetcherService.new.call
    puts "完了: #{result[:saved]}件保存 / #{result[:skipped]}件スキップ（重複）"
  end
end
