FactoryBot.define do
  factory :personal_event do
    title { "MyString" }
    memo { "MyText" }
    event_date { "2026-06-10" }
    user { nil }
  end
end
