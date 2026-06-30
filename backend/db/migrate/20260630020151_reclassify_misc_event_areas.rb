# frozen_string_literal: true

class ReclassifyMiscEventAreas < ActiveRecord::Migration[7.2]
  TITLE_TO_AREA = {
    "会津若松 歴史ウォーク 〜鶴ヶ城から武家屋敷へ〜" => "会津若松市",
    "【花火大会にて出店をご希望のみなさまへ】令和8年度流灯花火大会出店要綱について" => "柳津町",
    "柳津町レンタサイクルの貸出について" => "柳津町",
    "【霊まつり】第88回霊まつり流灯花火大会有料観覧席発売開始します" => "柳津町",
    "【第89回霊まつり流灯花火大会】 有料観覧席 6月19日より販売開始します" => "柳津町",
    "会津柳津駅舎「あいべこ」只見線和菓子の日ウィーク開催のお知らせ" => "柳津町",
    "【瀞流の宿かわち】初夏の味わい「新緑ランチプラン」登場！" => "柳津町",
    "ついに公開！赤べこ誕生の地を歩く──絵馬ヶ澤と圓藏寺の物語" => "柳津町",
    "第89回霊まつり流灯花火大会　マイ灯ろう申込受付開始" => "柳津町",
    "第89回 霊まつり流灯花火大会に関するご協賛・マイ花火についてのお知らせ" => "柳津町",
    "【ふくしまDC特別企画】ご利益たっぷり！歴史ガイドと巡る「会津六詣で」日帰りバスツアー" => "柳津町"
  }.freeze

  def up
    TITLE_TO_AREA.each do |title, area|
      Event.where(title: title, area: "その他").update_all(area: area)
    end
  end

  def down
    TITLE_TO_AREA.each do |title, area|
      Event.where(title: title, area: area).update_all(area: "その他")
    end
  end
end
