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

puts "✅ イベントシードデータ投入完了: #{Event.count}件のイベントが登録されました"

# 観光スポット初期データ（30件）
spots_data = [
  # 県北エリア（5件）
  {
    name: "花見山公園",
    description: "福島市を代表する花の名所。春になると梅・桃・桜・レンギョウなど数十種類の花が一斉に咲き乱れ、「福島に桃源郷あり」と称されます。",
    area: "県北",
    municipality: "福島市",
    address: "福島県福島市渡利字花見山",
    category: "自然",
    season: "spring",
    latitude: 37.7338,
    longitude: 140.4891,
    official_url: "https://hanamiyama.jp/",
    opening_hours: "日の出〜日没（開花時期のみ公開）",
    access: "JR福島駅東口からバス・タクシーで約20分",
    admission_fee: "無料"
  },
  {
    name: "飯坂温泉",
    description: "日本三大漬物の一つ「飯坂漬」発祥の地でもある東北最古の温泉地。泉質はアルカリ性単純温泉で、肌がつるつるになる美人の湯として知られます。",
    area: "県北",
    municipality: "福島市",
    address: "福島県福島市飯坂町",
    category: "温泉",
    season: "all",
    latitude: 37.8081,
    longitude: 140.4478,
    official_url: "https://iizaka.com/",
    access: "福島交通飯坂電車「飯坂温泉駅」下車すぐ",
    admission_fee: "施設によって異なる"
  },
  {
    name: "土湯温泉",
    description: "吾妻連峰の麓に湧く温泉地。秘湯として知られ、こけしの産地としても有名。渓谷沿いに旅館が点在し、四季折々の自然美が楽しめます。",
    area: "県北",
    municipality: "福島市",
    address: "福島県福島市土湯温泉町",
    category: "温泉",
    season: "all",
    latitude: 37.6906,
    longitude: 140.3328,
    official_url: "https://www.tsuchiyu.or.jp/",
    access: "JR福島駅西口からバスで約50分",
    admission_fee: "施設によって異なる"
  },
  {
    name: "福島市飯野町きつねむら",
    description: "福島市飯野町の「きつねむら」。荒廃していた里山を地域おこしとして整備し、キツネを間近で見られることで人気のスポット。",
    area: "県北",
    municipality: "福島市",
    address: "福島県福島市飯野町青木",
    category: "体験・アクティビティ",
    season: "all",
    latitude: 37.6423,
    longitude: 140.3819,
    admission_fee: "大人500円"
  },
  {
    name: "霊山こどもの村",
    description: "県立の自然公園に隣接するアスレチック公園。巨大な木製のアスレチック施設があり、子どもたちが自然の中で思い切り遊べます。",
    area: "県北",
    municipality: "伊達市",
    address: "福島県伊達市霊山町大石字屋敷平",
    category: "体験・アクティビティ",
    season: "all",
    latitude: 37.8266,
    longitude: 140.5803,
    official_url: "https://ryozen-kodomonomura.com/",
    opening_hours: "9:00〜17:00",
    access: "JR伊達駅からバスで約40分",
    admission_fee: "大人420円・子ども310円"
  },

  # 県中エリア（5件）
  {
    name: "三春滝桜",
    description: "樹齢推定1000年を超える国指定天然記念物の一本桜。日本三大桜の一つで、ベニシダレザクラの巨木が圧倒的な存在感を誇ります。",
    area: "県中",
    municipality: "三春町",
    address: "福島県田村郡三春町大字滝字桜久保",
    category: "自然",
    season: "spring",
    latitude: 37.4380,
    longitude: 140.4797,
    official_url: "https://www.town.miharu.fukushima.jp/",
    opening_hours: "見頃期間：4月上旬〜中旬",
    access: "JR三春駅からタクシーで約10分",
    admission_fee: "無料（見頃期間は入場料300円）"
  },
  {
    name: "あぶくま洞",
    description: "約8000万年の時を経て形成された全長600メートルの鍾乳洞。幻想的な鍾乳石が織りなす地底世界は圧巻。年間を通じて14℃前後に保たれています。",
    area: "県中",
    municipality: "田村市",
    address: "福島県田村市滝根町菅谷字東山",
    category: "自然",
    season: "all",
    latitude: 37.3696,
    longitude: 140.7036,
    official_url: "https://abukumado.com/",
    opening_hours: "8:30〜17:00",
    access: "JR磐城守山駅からタクシーで約15分",
    admission_fee: "大人1200円・小中学生600円"
  },
  {
    name: "ビッグパレットふくしま",
    description: "福島県最大の展示・イベント会場。コンサート・展示会・見本市など多彩なイベントが年間を通じて開催されます。",
    area: "県中",
    municipality: "郡山市",
    address: "福島県郡山市南2丁目52番地",
    category: "その他",
    season: "all",
    latitude: 37.3607,
    longitude: 140.3847,
    official_url: "https://www.big-palette.jp/",
    opening_hours: "イベントにより異なる",
    access: "JR郡山駅から車で約10分",
    admission_fee: "イベントによって異なる"
  },
  {
    name: "安積国造神社",
    description: "郡山市を代表する古社。毎年4月に行われる「安積國造神社例大祭」では神輿渡御が行われ、多くの参拝者で賑わいます。",
    area: "県中",
    municipality: "郡山市",
    address: "福島県郡山市清水台1丁目6-23",
    category: "歴史・文化",
    season: "all",
    latitude: 37.3947,
    longitude: 140.3843,
    official_url: "https://asaka-kunitsukomori.jp/",
    opening_hours: "参拝自由",
    access: "JR郡山駅から徒歩約15分",
    admission_fee: "無料"
  },
  {
    name: "開成山公園",
    description: "郡山市の中心部に位置する公園。桜の名所として知られ、約1000本のソメイヨシノが咲き誇る春には花見客で賑わいます。",
    area: "県中",
    municipality: "郡山市",
    address: "福島県郡山市開成",
    category: "自然",
    season: "spring",
    latitude: 37.3971,
    longitude: 140.3788,
    opening_hours: "常時開放",
    access: "JR郡山駅から徒歩約20分",
    admission_fee: "無料"
  },

  # 県南エリア（3件）
  {
    name: "南湖公園",
    description: "享和元年（1801年）に白河藩主・松平定信が築造した日本最古の公共公園。湖の周囲に松並木が続き、四季折々の美しさを楽しめます。",
    area: "県南",
    municipality: "白河市",
    address: "福島県白河市砂山",
    category: "歴史・文化",
    season: "spring",
    latitude: 37.1167,
    longitude: 140.2067,
    official_url: "https://www.city.shirakawa.fukushima.jp/",
    opening_hours: "常時開放",
    access: "JR白河駅からバスで約5分",
    admission_fee: "無料"
  },
  {
    name: "白河小峰城",
    description: "東北有数の城として知られる三重の隅櫓。国の重要文化財に指定されており、石垣と天守が往時の姿を今に伝えます。",
    area: "県南",
    municipality: "白河市",
    address: "福島県白河市郭内1",
    category: "歴史・文化",
    season: "all",
    latitude: 37.1247,
    longitude: 140.2101,
    official_url: "https://www.city.shirakawa.fukushima.jp/",
    opening_hours: "9:00〜17:00",
    access: "JR白河駅から徒歩約5分",
    admission_fee: "無料（天守内は有料）"
  },
  {
    name: "那須甲子道の駅",
    description: "白河市と那須（栃木）の境に位置する道の駅。地元の農産物や特産品が揃い、那須連峰の眺望も楽しめるドライブの拠点です。",
    area: "県南",
    municipality: "白河市",
    address: "福島県西白河郡西郷村真船字真船山1",
    category: "道の駅",
    season: "all",
    latitude: 37.0358,
    longitude: 140.1047,
    opening_hours: "9:00〜18:00",
    access: "東北自動車道「白河IC」から約30分",
    admission_fee: "無料"
  },

  # 会津エリア（8件）
  {
    name: "鶴ヶ城（会津若松城）",
    description: "会津のシンボル。戊辰戦争で一ヶ月の籠城戦に耐えた難攻不落の城として知られ、桜の名所としても全国的に有名。天守閣内は博物館になっています。",
    area: "会津",
    municipality: "会津若松市",
    address: "福島県会津若松市追手町1-1",
    category: "歴史・文化",
    season: "spring",
    latitude: 37.4944,
    longitude: 139.9301,
    official_url: "https://www.tsurugajo.com/",
    opening_hours: "8:30〜17:00",
    access: "JR会津若松駅からバスで約15分",
    admission_fee: "大人410円・高校生以下無料"
  },
  {
    name: "大内宿",
    description: "江戸時代の宿場町の面影をそのまま残す国の重要伝統的建造物群保存地区。茅葺き屋根の民家が立ち並び、ネギ一本で食べる「高遠そば」が名物。",
    area: "会津",
    municipality: "下郷町",
    address: "福島県南会津郡下郷町大字大内",
    category: "歴史・文化",
    season: "all",
    latitude: 37.3030,
    longitude: 139.8519,
    official_url: "https://www.ouchi-juku.com/",
    opening_hours: "常時開放（各店舗は10:00〜17:00頃）",
    access: "会津鉄道「湯野上温泉駅」からバスで約20分",
    admission_fee: "無料"
  },
  {
    name: "猪苗代湖",
    description: "面積は国内4位を誇る湖。「天鏡湖」とも呼ばれ、磐梯山を背景に広がる絶景は圧巻。夏は水遊び・冬はワカサギ釣りなど四季を通じて楽しめます。",
    area: "会津",
    municipality: "猪苗代町",
    address: "福島県耶麻郡猪苗代町",
    category: "自然",
    season: "summer",
    latitude: 37.4800,
    longitude: 140.0950,
    official_url: "https://www.bandaisan.or.jp/",
    access: "JR猪苗代駅から車で約10分",
    admission_fee: "無料（施設利用は別途）"
  },
  {
    name: "喜多方ラーメン館",
    description: "全国的に有名な喜多方ラーメンを一堂に楽しめる施設。市内の有名店のラーメンをはじめ、ラーメングッズや土産品も充実しています。",
    area: "会津",
    municipality: "喜多方市",
    address: "福島県喜多方市字御清水東7258-1",
    category: "その他",
    season: "all",
    latitude: 37.6499,
    longitude: 139.8678,
    official_url: "https://www.kitakata-ramen.com/",
    opening_hours: "9:00〜18:00",
    access: "JR喜多方駅から徒歩約15分",
    admission_fee: "無料（飲食は別途）"
  },
  {
    name: "磐梯山ゴールドラインと五色沼",
    description: "磐梯朝日国立公園内に点在するコバルトブルーや emerald グリーンの神秘的な沼群。紅葉シーズンは特に美しく、散策路が整備されています。",
    area: "会津",
    municipality: "北塩原村",
    address: "福島県耶麻郡北塩原村桧原剣ケ峯",
    category: "自然",
    season: "autumn",
    latitude: 37.6372,
    longitude: 140.0531,
    official_url: "https://www.urabandai-inf.com/",
    opening_hours: "散策自由",
    access: "JR猪苗代駅からバスで約40分",
    admission_fee: "無料"
  },
  {
    name: "会津武家屋敷",
    description: "会津藩の家老・西郷頼母の屋敷を復元した歴史テーマパーク。戊辰戦争で自刃した西郷家の悲話を伝える展示もあります。",
    area: "会津",
    municipality: "会津若松市",
    address: "福島県会津若松市東山町石山院内1",
    category: "歴史・文化",
    season: "all",
    latitude: 37.4930,
    longitude: 139.9467,
    official_url: "https://www.bukeyashiki.com/",
    opening_hours: "8:30〜17:00（冬期短縮あり）",
    access: "JR会津若松駅からバスで約15分",
    admission_fee: "大人850円・小中学生430円"
  },
  {
    name: "道の駅 会津柳津",
    description: "会津柳津町の中心部にある道の駅。名物の「あわまんじゅう」や地元農産物が人気。円蔵寺（柳津虚空蔵尊）も隣接しています。",
    area: "会津",
    municipality: "柳津町",
    address: "福島県河沼郡柳津町大字柳津字下平乙234-1",
    category: "道の駅",
    season: "all",
    latitude: 37.5489,
    longitude: 139.7133,
    opening_hours: "9:00〜18:00",
    access: "JR会津柳津駅から徒歩約10分",
    admission_fee: "無料"
  },
  {
    name: "裏磐梯レイクリゾート",
    description: "磐梯山の噴火で形成された湖沼群エリアのリゾート地。カヌー・トレッキング・スノーシューなど四季を通じてアクティビティが充実しています。",
    area: "会津",
    municipality: "北塩原村",
    address: "福島県耶麻郡北塩原村",
    category: "体験・アクティビティ",
    season: "all",
    latitude: 37.6500,
    longitude: 140.0367,
    official_url: "https://www.urabandai-inf.com/",
    access: "JR猪苗代駅からバスで約50分",
    admission_fee: "施設によって異なる"
  },

  # 南会津エリア（3件）
  {
    name: "塔のへつり",
    description: "阿賀川（大川）が100万年かけて浸食・風化させた奇岩群。吊橋を渡って岩壁の遊歩道を歩くことができる国の天然記念物。",
    area: "南会津",
    municipality: "下郷町",
    address: "福島県南会津郡下郷町弥五島下タ林",
    category: "自然",
    season: "autumn",
    latitude: 37.2508,
    longitude: 139.8933,
    opening_hours: "常時開放（冬期は一部制限あり）",
    access: "会津鉄道「塔のへつり駅」から徒歩約5分",
    admission_fee: "無料"
  },
  {
    name: "湯野上温泉",
    description: "阿賀川沿いに湧く温泉地。日本で唯一の茅葺き屋根の駅舎「湯野上温泉駅」でも有名。大内宿へのアクセス拠点でもあります。",
    area: "南会津",
    municipality: "下郷町",
    address: "福島県南会津郡下郷町湯野上",
    category: "温泉",
    season: "all",
    latitude: 37.2795,
    longitude: 139.8680,
    access: "会津鉄道「湯野上温泉駅」から徒歩すぐ",
    admission_fee: "施設によって異なる"
  },
  {
    name: "道の駅 番屋",
    description: "南会津エリアへの玄関口にある道の駅。地元の野菜・山菜・そばなど南会津の特産品が充実。食堂では地元そばが楽しめます。",
    area: "南会津",
    municipality: "南会津町",
    address: "福島県南会津郡南会津町界字上ノ原1028-3",
    category: "道の駅",
    season: "all",
    latitude: 37.1619,
    longitude: 139.7594,
    opening_hours: "8:30〜18:00",
    access: "会津鉄道「会津田島駅」から車で約15分",
    admission_fee: "無料"
  },

  # いわきエリア（4件）
  {
    name: "スパリゾートハワイアンズ",
    description: "国の近代化産業遺産にも認定された常磐ハワイアンセンターが前身。フラダンスショーと温泉・プールが楽しめる東北最大級のリゾート施設。",
    area: "いわき",
    municipality: "いわき市",
    address: "福島県いわき市常磐藤原町蕨平50",
    category: "テーマパーク",
    season: "all",
    latitude: 37.0383,
    longitude: 140.9397,
    official_url: "https://www.hawaiians.co.jp/",
    opening_hours: "10:00〜18:00（季節により変動）",
    access: "JRいわき駅から無料シャトルバスで約30分",
    admission_fee: "大人2750円〜（プランにより異なる）"
  },
  {
    name: "いわき市石炭・化石館（ほるる）",
    description: "炭鉱の歴史と恐竜の化石を展示する博物館。実物大の恐竜骨格標本や採炭体験コーナーがあり、子どもに大人気。フタバスズキリュウの実物化石も展示。",
    area: "いわき",
    municipality: "いわき市",
    address: "福島県いわき市常磐湯本町向田3-1",
    category: "歴史・文化",
    season: "all",
    latitude: 37.0492,
    longitude: 140.9436,
    official_url: "https://www.sekitan-kaseki.jp/",
    opening_hours: "9:00〜17:00（火曜定休）",
    access: "JR湯本駅から徒歩約10分",
    admission_fee: "大人660円・小中学生330円"
  },
  {
    name: "アクアマリンふくしま",
    description: "「海・生命・風」をテーマにした水族館。福島の海・三陸の海をはじめ世界の海が楽しめます。大型シーラカンスの液浸標本など希少な展示も。",
    area: "いわき",
    municipality: "いわき市",
    address: "福島県いわき市小名浜字辰巳町50",
    category: "体験・アクティビティ",
    season: "all",
    latitude: 36.9606,
    longitude: 140.9053,
    official_url: "https://www.aquamarine.or.jp/",
    opening_hours: "9:00〜17:30",
    access: "JRいわき駅からバスで約40分",
    admission_fee: "大人1850円・高校生1240円・小中学生930円"
  },
  {
    name: "国営ひたち海浜公園（いわきからのアクセス）",
    description: "いわき市から北茨城を経由してアクセス可能な大規模公園。春のネモフィラや秋のコキアで全国的に有名。",
    area: "いわき",
    municipality: "いわき市",
    address: "茨城県ひたちなか市馬渡字大沼605-4",
    category: "自然",
    season: "spring",
    latitude: 36.4063,
    longitude: 140.5797,
    official_url: "https://hitachikaihin.jp/",
    opening_hours: "9:30〜17:00（季節により変動）",
    access: "JRいわき駅から常磐線で勝田駅へ、シャトルバスで約15分",
    admission_fee: "大人450円・小中学生無料"
  },

  # 相双エリア（2件）
  {
    name: "松川浦",
    description: "相馬市の海岸に広がる潟湖。東北の松島とも呼ばれ、砂州に生える松並木と穏やかな水面が美しい。漁師料理のカレイの煮付けや刺身も名物。",
    area: "相双",
    municipality: "相馬市",
    address: "福島県相馬市松川浦",
    category: "自然",
    season: "all",
    latitude: 37.8272,
    longitude: 140.9667,
    official_url: "https://www.city.soma.fukushima.jp/",
    opening_hours: "常時開放",
    access: "JR相馬駅から車で約10分",
    admission_fee: "無料"
  },
  {
    name: "相馬野馬追の里 相馬中村神社",
    description: "千年以上の歴史を誇る祭礼「相馬野馬追」の根拠地となる神社。毎年7月に行われる相馬野馬追は国の重要無形民俗文化財に指定されています。",
    area: "相双",
    municipality: "相馬市",
    address: "福島県相馬市中村字北町140",
    category: "歴史・文化",
    season: "summer",
    latitude: 37.7999,
    longitude: 140.9246,
    official_url: "https://www.soma-nomaoi.jp/",
    opening_hours: "参拝自由",
    access: "JR相馬駅から徒歩約10分",
    admission_fee: "無料"
  }
]

spots_data.each do |attrs|
  Spot.find_or_create_by!(name: attrs[:name]) do |spot|
    spot.assign_attributes(attrs)
  end
end

puts "✅ スポットシードデータ投入完了: #{Spot.count}件の観光スポットが登録されました"

# グルメスポット初期データ（20件）
restaurants_data = [
  # 県北エリア（3件）
  {
    name: "山女や",
    description: "福島市の中心部にある郷土料理店。囲炉裏で焼く川魚料理が名物で、地元産の鮎・岩魚・山女魚を味わえます。",
    area: "県北",
    municipality: "福島市",
    address: "福島県福島市大町8-21",
    category: "和食",
    genre: "和食",
    phone: "024-521-XXXX",
    opening_hours: "11:00〜14:00 / 17:00〜22:00（火曜定休）",
    budget: "3000〜4000円",
    source: "manual",
    status: "published"
  },
  {
    name: "喜楽",
    description: "飯坂温泉街にある老舗そば店。地元産のそば粉を使った手打ちそばが自慢で、温泉帰りの一杯に最適。",
    area: "県北",
    municipality: "福島市",
    address: "福島県福島市飯坂町湯沢1",
    category: "和食",
    genre: "そば・うどん",
    opening_hours: "11:00〜15:00（水曜定休）",
    budget: "800〜1500円",
    source: "manual",
    status: "published"
  },
  {
    name: "カフェ杜",
    description: "花見山公園近くのカフェ。地元産フルーツを使ったスイーツとコーヒーが楽しめる落ち着いた空間。",
    area: "県北",
    municipality: "福島市",
    address: "福島県福島市渡利字花見山周辺",
    category: "カフェ・スイーツ",
    genre: "カフェ・スイーツ",
    opening_hours: "10:00〜17:00（水・木曜定休）",
    budget: "500〜1000円",
    source: "manual",
    status: "published"
  },

  # 県中エリア（5件）
  {
    name: "郡山フレンチ ル・シェーヌ",
    description: "郡山市内の本格フレンチレストラン。福島県産食材にこだわったコース料理が人気。記念日や接待にも利用される。",
    area: "県中",
    municipality: "郡山市",
    address: "福島県郡山市麓山1丁目",
    category: "フレンチ",
    genre: "フレンチ",
    opening_hours: "11:30〜14:00 / 18:00〜21:00（月曜定休）",
    budget: "5000〜10000円",
    source: "manual",
    status: "published"
  },
  {
    name: "田村ラーメン 一心",
    description: "郡山で長年愛される醤油ラーメンの名店。鶏ガラベースのあっさりスープと中太ちぢれ麺が特徴。",
    area: "県中",
    municipality: "郡山市",
    address: "福島県郡山市開成3丁目",
    category: "ラーメン",
    genre: "ラーメン",
    opening_hours: "11:00〜21:00（火曜定休）",
    budget: "700〜1200円",
    source: "manual",
    status: "published"
  },
  {
    name: "三春亭",
    description: "三春町産のそばと地元野菜を使った創作和食が楽しめるレストラン。三春滝桜観光の帰りに立ち寄る観光客に人気。",
    area: "県中",
    municipality: "三春町",
    address: "福島県田村郡三春町大町",
    category: "和食",
    genre: "和食",
    opening_hours: "11:00〜15:00",
    budget: "1000〜2000円",
    source: "manual",
    status: "published"
  },
  {
    name: "焼肉 安積苑",
    description: "郡山市内で人気の焼肉店。福島牛をはじめとした地元産の黒毛和牛が手頃な価格で楽しめる。",
    area: "県中",
    municipality: "郡山市",
    address: "福島県郡山市安積町",
    category: "焼肉",
    genre: "焼肉",
    opening_hours: "17:00〜23:00",
    budget: "3000〜5000円",
    source: "manual",
    status: "published"
  },
  {
    name: "イタリアンカフェ ピアッツァ",
    description: "郡山市内の明るいイタリアンレストラン。福島県産野菜を使ったパスタとピザが人気で、ランチタイムはリーズナブル。",
    area: "県中",
    municipality: "郡山市",
    address: "福島県郡山市中町",
    category: "イタリアン",
    genre: "イタリアン",
    opening_hours: "11:00〜22:00",
    budget: "1500〜3000円",
    source: "manual",
    status: "published"
  },

  # 会津エリア（7件）
  {
    name: "鶴ヶ城会館",
    description: "鶴ヶ城に隣接する観光施設内のレストラン。会津の郷土料理「こづゆ」や会津漆器の器で供される会席料理が楽しめる。",
    area: "会津",
    municipality: "会津若松市",
    address: "福島県会津若松市追手町1-1",
    category: "和食",
    genre: "和食",
    opening_hours: "11:00〜16:00",
    budget: "1500〜3000円",
    source: "manual",
    status: "published"
  },
  {
    name: "喜多方食堂 坂内",
    description: "喜多方ラーメンの代名詞的な名店。あっさり醤油スープに平打ち熟成多加水麺が特徴。早朝からラーメンを食べる「朝ラー」文化発祥の店。",
    area: "会津",
    municipality: "喜多方市",
    address: "福島県喜多方市小田付道上7745",
    category: "ラーメン",
    genre: "ラーメン",
    opening_hours: "7:30〜18:00（木曜定休）",
    budget: "700〜1000円",
    source: "manual",
    status: "published"
  },
  {
    name: "大内宿三澤屋",
    description: "大内宿で最も有名なそば店。ネギ一本を箸代わりにして食べる「高遠そば」が名物。茅葺き屋根の建物で江戸時代の雰囲気を味わえる。",
    area: "会津",
    municipality: "下郷町",
    address: "福島県南会津郡下郷町大字大内字山本24",
    category: "和食",
    genre: "そば・うどん",
    opening_hours: "10:30〜15:00（不定休）",
    budget: "1200〜2000円",
    source: "manual",
    status: "published"
  },
  {
    name: "会津ワイナリー レストラン",
    description: "会津産ぶどうを使ったワインと地元食材のマリアージュが楽しめるレストラン。ワイナリー見学とセットで利用できる。",
    area: "会津",
    municipality: "会津若松市",
    address: "福島県会津若松市門田町",
    category: "洋食",
    genre: "洋食",
    opening_hours: "11:00〜15:00",
    budget: "2000〜4000円",
    source: "manual",
    status: "published"
  },
  {
    name: "中国料理 龍鳳",
    description: "会津若松市内の本格中華料理店。担々麺と点心が人気で、ランチのセットは地元のビジネスマンに重宝されている。",
    area: "会津",
    municipality: "会津若松市",
    address: "福島県会津若松市中央1丁目",
    category: "中華",
    genre: "中華",
    opening_hours: "11:30〜14:30 / 17:00〜21:00（火曜定休）",
    budget: "1000〜2500円",
    source: "manual",
    status: "published"
  },
  {
    name: "猪苗代湖畔カフェ 天鏡",
    description: "猪苗代湖を一望できるカフェ。地元産りんごを使ったアップルパイとコーヒーが名物。夕暮れ時は特に絶景。",
    area: "会津",
    municipality: "猪苗代町",
    address: "福島県耶麻郡猪苗代町湖南",
    category: "カフェ・スイーツ",
    genre: "カフェ・スイーツ",
    opening_hours: "10:00〜17:00（不定休）",
    budget: "500〜1000円",
    source: "manual",
    status: "published"
  },
  {
    name: "馬刺し・郷土料理 酔心",
    description: "会津の郷土料理専門店。馬刺し・こづゆ・にしんの山椒漬けなど会津の伝統料理を一度に楽しめる。会津地酒も充実。",
    area: "会津",
    municipality: "会津若松市",
    address: "福島県会津若松市大町1丁目",
    category: "和食",
    genre: "和食",
    opening_hours: "17:00〜23:00（日曜定休）",
    budget: "3000〜5000円",
    source: "manual",
    status: "published"
  },

  # いわきエリア（3件）
  {
    name: "いわき回転寿司 魚楽",
    description: "いわき市の鮮魚を使った回転寿司。常磐沖で獲れた地魚を中心にした鮮度抜群のネタが自慢。",
    area: "いわき",
    municipality: "いわき市",
    address: "福島県いわき市平字童子町",
    category: "和食",
    genre: "寿司",
    opening_hours: "11:00〜21:00",
    budget: "1500〜3000円",
    source: "manual",
    status: "published"
  },
  {
    name: "湯本温泉 割烹旅館 松葉",
    description: "湯本温泉街にある割烹旅館の食事処。常磐の海の幸を使った会席料理が楽しめる。日帰り食事プランも対応。",
    area: "いわき",
    municipality: "いわき市",
    address: "福島県いわき市常磐湯本町",
    category: "和食",
    genre: "和食",
    opening_hours: "12:00〜14:00 / 18:00〜21:00（要予約）",
    budget: "5000〜10000円",
    source: "manual",
    status: "published"
  },
  {
    name: "スパリゾートハワイアンズ バイキング",
    description: "スパリゾートハワイアンズ内のバイキングレストラン。和洋中の料理が揃い、家族連れや団体旅行に最適。",
    area: "いわき",
    municipality: "いわき市",
    address: "福島県いわき市常磐藤原町蕨平50",
    category: "その他",
    genre: "その他グルメ",
    opening_hours: "11:00〜21:00",
    budget: "2000〜3500円",
    source: "manual",
    status: "published"
  },

  # 相双エリア（2件）
  {
    name: "相馬港直売所 海鮮食堂",
    description: "相馬港で水揚げされた新鮮な魚介類を使った海鮮丼と定食が人気。水揚げ直後の鮮度は格別。",
    area: "相双",
    municipality: "相馬市",
    address: "福島県相馬市沖ノ内1丁目",
    category: "和食",
    genre: "海鮮",
    opening_hours: "10:00〜15:00（月曜定休）",
    budget: "1000〜2500円",
    source: "manual",
    status: "published"
  },
  {
    name: "相馬中村 うなぎ 川富",
    description: "相馬市の老舗うなぎ料理店。地元で長年愛される蒲焼きは甘辛のタレと香ばしい香りが特徴。",
    area: "相双",
    municipality: "相馬市",
    address: "福島県相馬市中村字北町",
    category: "和食",
    genre: "和食",
    opening_hours: "11:30〜14:00 / 17:00〜20:00（水曜定休）",
    budget: "3000〜5000円",
    source: "manual",
    status: "published"
  }
]

restaurants_data.each do |attrs|
  Restaurant.find_or_create_by!(name: attrs[:name]) do |r|
    r.assign_attributes(attrs)
  end
end

puts "✅ グルメシードデータ投入完了: #{Restaurant.count}件のレストランが登録されました"

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

# Adminユーザー（ローカル開発用）
admin_user = User.find_or_initialize_by(email: '3.fortschritt@gmail.com')
if admin_user.new_record?
  admin_user.assign_attributes(
    password: 'adminpass123',
    password_confirmation: 'adminpass123',
    name: 'Admin',
    uid: '3.fortschritt@gmail.com',
    role: 'admin'
  )
  admin_user.save!
  puts "✅ Adminユーザー作成: #{admin_user.email}"
else
  admin_user.update!(role: 'admin')
  puts "ℹ️  Adminユーザーは既に存在します（role更新済み）: #{admin_user.email}"
end
