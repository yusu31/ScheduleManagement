# frozen_string_literal: true

namespace :rss do
  desc "RSSフィードからイベントを取得してDBに保存する"
  task fetch: :environment do
    puts "RSS取得を開始します..."
    result = RssFetcherService.new.call
    puts "完了: 保存=#{result[:saved]}件 スキップ=#{result[:skipped]}件 エラー=#{result[:errors]}件"
  end
end
