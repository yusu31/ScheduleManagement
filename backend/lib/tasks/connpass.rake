# frozen_string_literal: true

namespace :connpass do
  desc "ConnpassAPIから福島関連イベントを取得してDBに保存する"
  task fetch: :environment do
    puts "Connpassイベント取得を開始します..."
    result = ConnpassFetcherService.new.call
    puts "完了: #{result[:saved]}件保存 / #{result[:skipped]}件スキップ（重複）"
  end

  desc "非Connpassデータ・県外イベントを削除してDBをリセット"
  task cleanup: :environment do
    non_connpass = Event.where.not(source: "connpass").count
    Event.where.not(source: "connpass").destroy_all
    puts "サンプルデータ削除: #{non_connpass}件"

    outside = Event.where(source: "connpass", area: "その他").count
    Event.where(source: "connpass", area: "その他").destroy_all
    puts "県外・不明エリアのConnpassイベント削除: #{outside}件"

    puts "クリーンアップ完了。残件数: #{Event.count}件"
  end

  desc "DBリセット後にConnpassから再取得"
  task reset_and_fetch: :environment do
    Rake::Task["connpass:cleanup"].invoke
    Rake::Task["connpass:fetch"].invoke
  end
end
