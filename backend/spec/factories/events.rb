FactoryBot.define do
  factory :event do
    title { "テストイベント" }
    area { "郡山市" }
    category { "音楽" }
    start_at { Time.zone.parse("2026-07-01 10:00") }
  end
end
