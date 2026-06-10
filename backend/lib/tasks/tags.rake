# frozen_string_literal: true

namespace :tags do
  desc "既存のすべてのイベントにタグを自動付与する"
  task backfill: :environment do
    tag_rules = ConnpassFetcherService::TAG_RULES

    updated = 0
    Event.find_each do |event|
      text = [ event.title, event.description ].compact.join(" ")
      tags = []

      tag_rules.each do |tag, keywords|
        tags << tag if keywords.any? { |kw| text.downcase.include?(kw.downcase) }
      end
      tags << "子連れOK" if event.category == "ファミリー" && !tags.include?("子連れOK")
      tags << (tags.include?("屋外") ? nil : "室内")
      tags = tags.compact.uniq

      event.update_columns(tags: tags)
      updated += 1
    end

    puts "#{updated} 件のイベントにタグを付与しました。"
  end
end
