FactoryBot.define do
  factory :spot do
    name { "テストスポット" }
    area { "県中" }
    municipality { "郡山市" }
    category { "自然" }
  end
end
