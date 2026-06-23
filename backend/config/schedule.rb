# frozen_string_literal: true

# whenever gem の設定ファイル（本番環境のcron設定）
# 本番サーバーで `whenever --update-crontab` を実行すると反映される

set :output, "log/cron.log"
set :environment, :production

# 毎日午前3時にConnpassイベントを取得
every 1.day, at: "3:00 am" do
  rake "connpass:fetch"
end

# 毎日午前4時にRSSフィードからイベントを取得
every 1.day, at: "4:00 am" do
  rake "rss:fetch"
end
