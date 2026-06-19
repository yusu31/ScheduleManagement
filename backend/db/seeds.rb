events_data = [
  {
    title: "郡山IT勉強会 #12 〜Ruby on Rails入門〜",
    description: "郡山市内のエンジニアが集まるIT勉強会です。今回はRuby on Railsの基礎から実践的なAPI開発まで学びます。初心者歓迎！",
    location: "郡山市中央図書館 研修室",
    area: "郡山市",
    category: "テクノロジー",
    start_at: Time.zone.now + 7.days,
    end_at: Time.zone.now + 7.days + 3.hours,
    capacity: 30,
    event_url: "https://connpass.com/event/sample1",
    source: "connpass"
  },
  {
    title: "福島マルシェ 〜地元野菜と手作り雑貨の市〜",
    description: "福島市内の農家や手工芸作家が集まるマルシェです。新鮮な地元野菜、手作りジャム、アクセサリーなどが並びます。家族みんなで楽しめます。",
    location: "福島市 四季の里",
    area: "福島市",
    category: "食・グルメ",
    start_at: Time.zone.now + 3.days,
    end_at: Time.zone.now + 3.days + 6.hours,
    capacity: nil,
    event_url: "https://example.com/event/fukushima-marche",
    source: "manual"
  },
  {
    title: "いわきサーフィン体験会",
    description: "いわき市の海でサーフィンを体験しよう！インストラクターが丁寧に指導します。道具はすべてレンタル可能。初心者・子ども歓迎。",
    location: "いわき市 四倉海水浴場",
    area: "いわき市",
    category: "スポーツ",
    start_at: Time.zone.now + 10.days,
    end_at: Time.zone.now + 10.days + 4.hours,
    capacity: 20,
    event_url: "https://example.com/event/iwaki-surf",
    source: "manual"
  },
  {
    title: "本宮ハイキング 〜安達太良山をのんびり歩こう〜",
    description: "「ほんとの空」で有名な安達太良山を家族でハイキング。紅葉シーズンの絶景を楽しみながら頂上を目指します。お弁当持参推奨。",
    location: "本宮市 安達太良山登山口",
    area: "本宮市",
    category: "自然・アウトドア",
    start_at: Time.zone.now + 14.days,
    end_at: Time.zone.now + 14.days + 8.hours,
    capacity: 50,
    event_url: "https://example.com/event/adatara-hiking",
    source: "manual"
  },
  {
    title: "会津若松 歴史ウォーク 〜鶴ヶ城から武家屋敷へ〜",
    description: "ガイドと一緒に会津若松の歴史スポットをめぐるウォーキングツアー。鶴ヶ城・武家屋敷・七日町通りを約3時間で歩きます。",
    location: "会津若松市 鶴ヶ城集合",
    area: "その他",
    category: "文化・伝統",
    start_at: Time.zone.now + 5.days,
    end_at: Time.zone.now + 5.days + 3.hours,
    capacity: 25,
    event_url: "https://example.com/event/aizu-walk",
    source: "manual"
  },
  {
    title: "郡山子ども科学フェスタ",
    description: "科学の不思議を体験しよう！空気砲・スライム作り・静電気実験など、子どもが楽しめる科学実験を多数用意。入場無料、雨天決行。",
    location: "郡山市 ビッグパレットふくしま",
    area: "郡山市",
    category: "ファミリー",
    start_at: Time.zone.now + 2.days,
    end_at: Time.zone.now + 2.days + 7.hours,
    capacity: nil,
    event_url: "https://example.com/event/koriyama-science",
    source: "manual"
  },
  {
    title: "Next.js + TypeScript ハンズオン勉強会（郡山）",
    description: "Next.js 14のApp Routerを使ったモダンなフロントエンド開発を実践的に学びます。TypeScript基礎知識があると理解しやすいです。",
    location: "郡山市 コワーキングスペースKORIYAMA",
    area: "郡山市",
    category: "テクノロジー",
    start_at: Time.zone.now + 21.days,
    end_at: Time.zone.now + 21.days + 4.hours,
    capacity: 20,
    event_url: "https://connpass.com/event/sample2",
    source: "connpass"
  },
  {
    title: "南相馬 夏まつり 2026",
    description: "南相馬市の夏を彩る伝統的なお祭りです。神輿・屋台・花火大会と盛りだくさん。家族みんなで楽しめます。",
    location: "南相馬市 海岸公園",
    area: "南相馬市",
    category: "祭り・イベント",
    start_at: Time.zone.now + 4.days,
    end_at: Time.zone.now + 4.days + 5.hours,
    capacity: nil,
    event_url: "https://example.com/event/minamisoma-matsuri",
    source: "manual"
  },
  {
    title: "白河ラーメンフェスティバル",
    description: "白河市内の有名ラーメン店が一堂に集結！老舗から新店まで10店舗が出店。青竹手打ち麺の実演コーナーもあります。",
    location: "白河市 南湖公園",
    area: "白河市",
    category: "食・グルメ",
    start_at: Time.zone.now + 8.days,
    end_at: Time.zone.now + 8.days + 8.hours,
    capacity: nil,
    event_url: "https://example.com/event/shirakawa-ramen",
    source: "manual"
  },
  {
    title: "いわきフラフェスティバル（フラダンス発表会）",
    description: "ハワイアン文化が根付くいわき市のフラダンス発表会。市内のフラスクール約20団体が参加します。無料観覧、撮影OK。",
    location: "いわき市 アリオス",
    area: "いわき市",
    category: "音楽",
    start_at: Time.zone.now + 12.days,
    end_at: Time.zone.now + 12.days + 6.hours,
    capacity: 500,
    event_url: "https://example.com/event/iwaki-hula",
    source: "manual"
  }
]

events_data.each do |attrs|
  Event.find_or_create_by!(title: attrs[:title]) do |event|
    event.assign_attributes(attrs)
  end
end

puts "✅ シードデータ投入完了: #{Event.count}件のイベントが登録されました"

# テストユーザー（ローカル開発用）
test_user = User.find_or_initialize_by(email: '2.fortschritt@gmail.com')
if test_user.new_record?
  test_user.assign_attributes(
    password: 'password123',
    password_confirmation: 'password123',
    name: 'Yusu',
    uid: '2.fortschritt@gmail.com'
  )
  test_user.save!
  puts "✅ テストユーザー作成: #{test_user.email}"
else
  puts "ℹ️  テストユーザーは既に存在します: #{test_user.email}"
end
