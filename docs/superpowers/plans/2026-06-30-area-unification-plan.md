# エリア区分統一 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Event / Spot / Restaurant のエリア値を、福島県の正式な59市町村リスト（`MunicipalityDetectorService::MUNICIPALITIES`）に統一する。

**Architecture:** 新しい市町村リストを作るのではなく、既存の `MunicipalityDetectorService::MUNICIPALITIES` を3モデル共通の単一の参照元（single source of truth）として使う。Event は `AREAS` 定数のバリデーション範囲を13市町村から59市町村＋オンラインに拡張する（スキーマ変更なし）。Spot / Restaurant は既に存在する `municipality` カラム（データは既に100%入力済み・無効値0件）にバリデーションを追加するだけで済む。既存データのうち Event の `area = 'その他'` 11件のみ、データ修正用マイグレーションで正しい市町村に再分類する。

**Tech Stack:** Ruby on Rails 7.2（APIモード）/ RSpec / FactoryBot / RuboCop（rubocop-rails-omakase）/ Next.js（App Router）/ TypeScript / ESLint

**設計書:** [docs/specs/2026-06-30-area-unification-design.md](../../specs/2026-06-30-area-unification-design.md)

---

## 前提知識（初めて触る人向け）

- **`%w[...]`** はRubyの記法で、`%w[a b c]` は `["a", "b", "c"]` と同じ意味（文字列配列をクォートなしで書ける）。
- **`MunicipalityDetectorService::MUNICIPALITIES`** は `backend/app/services/municipality_detector_service.rb` に定義済みの、福島県59市町村の正式リスト定数。今回はこれを書き換えず、参照するだけ。
- **`inclusion: { in: 配列 }`** はRailsのバリデーションで「この値が配列の中のどれかでなければ無効」という意味。
- 作業前に必ずGitHub Issueを作成し、ブランチを切ってから実装する（プロジェクトのCLAUDE.mdのルール）。

---

### Task 1: Issue作成・ブランチ作成

**Files:** なし（GitHub操作のみ）

- [ ] **Step 1: Issueを作成する**

```bash
gh issue create --title "feat: エリア区分を福島県59市町村に統一する" --label enhancement --body "$(cat <<'EOF'
## 背景・目的

Event / Spot / Restaurant のエリア値が、Event=13市町村、Spot/Restaurant=7地方区分とバラバラで、横断検索（Phase 4-B）の前提として統一が必要。
設計書: docs/specs/2026-06-30-area-unification-design.md

## 変更内容

- [ ] Event::AREAS を福島県59市町村＋オンラインに拡張
- [ ] Event の area='その他' 11件をデータ修正マイグレーションで再分類
- [ ] Spot.municipality にバリデーション追加
- [ ] Restaurant.municipality にバリデーション追加
- [ ] frontend FilterDrawer.tsx に欠落していた3市町村を追加

## 完了条件

- [ ] RuboCop 0 offenses
- [ ] RSpec 全テストパス
- [ ] ESLint 0 errors / 0 warnings
- [ ] ローカルでイベント検索・スポット検索のエリア絞り込みが正しく動作することを確認
EOF
)"
```

実行結果に表示されるIssue番号（例: `#168`）を控えておく。以降のステップでは `<Issue番号>` をこの番号に置き換える。

- [ ] **Step 2: ブランチを作成する**

```bash
cd c:/Users/3fort/RaiseTech/EventFinder
git checkout main
git pull origin main
git checkout -b feature/area-unification-#<Issue番号>
```

---

### Task 2: Event::AREASを59市町村に拡張する

**Files:**
- Create: `backend/spec/factories/events.rb`
- Create: `backend/spec/models/event_spec.rb`
- Modify: `backend/app/models/event.rb:4-7`

- [ ] **Step 1: Eventのfactoryを作成する**

```ruby
# backend/spec/factories/events.rb
FactoryBot.define do
  factory :event do
    title { "テストイベント" }
    area { "郡山市" }
    category { "音楽" }
    start_at { Time.zone.parse("2026-07-01 10:00") }
  end
end
```

- [ ] **Step 2: 失敗するテストを書く**

```ruby
# backend/spec/models/event_spec.rb
require 'rails_helper'

RSpec.describe Event, type: :model do
  describe 'area バリデーション' do
    it '13市町村に含まれない市町村（会津若松市）でも有効' do
      event = build(:event, area: '会津若松市')
      expect(event).to be_valid
    end

    it 'オンラインなら有効' do
      event = build(:event, area: 'オンライン')
      expect(event).to be_valid
    end

    it '福島県の市町村でもオンラインでもない値なら無効' do
      event = build(:event, area: '東京都')
      expect(event).not_to be_valid
      expect(event.errors[:area]).to be_present
    end

    it 'その他はもう許可されない' do
      event = build(:event, area: 'その他')
      expect(event).not_to be_valid
    end
  end
end
```

- [ ] **Step 3: テストを実行して失敗を確認する**

Run: `cd backend && bundle exec rspec spec/models/event_spec.rb`
Expected: 1つ目「会津若松市でも有効」と2つ目「オンラインなら有効」のテストが FAIL（現在のAREASには含まれないため `be_valid` が false になる）

- [ ] **Step 4: Event::AREASを拡張する**

`backend/app/models/event.rb:4-7` を以下に置き換える。

```ruby
  AREAS = (MunicipalityDetectorService::MUNICIPALITIES + %w[オンライン]).freeze
```

変更後の冒頭部分（参考）:

```ruby
# frozen_string_literal: true

class Event < ApplicationRecord
  AREAS = (MunicipalityDetectorService::MUNICIPALITIES + %w[オンライン]).freeze

  CATEGORIES = %w[
    スポーツ 音楽 アート 食・グルメ 自然・アウトドア 文化・伝統 ファミリー
    テクノロジー 教育 祭り・イベント その他
  ].freeze
```

- [ ] **Step 5: テストを実行して成功を確認する**

Run: `cd backend && bundle exec rspec spec/models/event_spec.rb`
Expected: 4 examples, 0 failures

- [ ] **Step 6: コミットする**

```bash
git add backend/spec/factories/events.rb backend/spec/models/event_spec.rb backend/app/models/event.rb
git commit -m "feat: Eventのareaを福島県59市町村+オンラインに拡張する"
```

---

### Task 3: 「その他」イベント11件を正しい市町村に再分類するマイグレーション

**Files:**
- Create: `backend/db/migrate/<タイムスタンプ>_reclassify_misc_event_areas.rb`

タイトル文字列で対象イベントを特定し、`area` を書き換える。ID（自動採番）ではなくタイトル文字列でマッチさせることで、開発環境・本番環境のどちらで実行しても正しく動く（IDは環境ごとに異なる可能性があるため）。

- [ ] **Step 1: マイグレーションファイルを生成する**

```bash
cd backend && bundle exec rails generate migration ReclassifyMiscEventAreas
```

- [ ] **Step 2: マイグレーションの中身を書く**

生成された `backend/db/migrate/<タイムスタンプ>_reclassify_misc_event_areas.rb` を以下の内容に置き換える。

```ruby
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
    TITLE_TO_AREA.each_key do |title|
      Event.where(title: title).update_all(area: "その他")
    end
  end
end
```

`update_all` を使う理由: 通常の `update` はモデルのバリデーションを通すが、マイグレーション内では「今その時点でのモデルコードの状態」に依存させたくない（移行作業そのものなので、バリデーションを経由せず直接SQLでデータを書き換えるのが安全）。

- [ ] **Step 3: マイグレーションを実行する**

Run: `cd backend && bundle exec rails db:migrate`
Expected: `== ReclassifyMiscEventAreas: migrating` のあとに `== ReclassifyMiscEventAreas: migrated` が表示される

- [ ] **Step 4: 「その他」が0件になったことを確認する**

```bash
cd backend && bundle exec rails runner "puts Event.where(area: 'その他').count"
```
Expected: `0`

- [ ] **Step 5: コミットする**

```bash
git add backend/db/migrate/*_reclassify_misc_event_areas.rb backend/db/schema.rb
git commit -m "fix: areaが「その他」だったイベント11件を正しい市町村に再分類する"
```

---

### Task 4: Spot.municipalityにバリデーションを追加する

**Files:**
- Create: `backend/spec/factories/spots.rb`
- Create: `backend/spec/models/spot_spec.rb`
- Modify: `backend/app/models/spot.rb:16-20`

- [ ] **Step 1: Spotのfactoryを作成する**

```ruby
# backend/spec/factories/spots.rb
FactoryBot.define do
  factory :spot do
    name { "テストスポット" }
    area { "県中" }
    municipality { "郡山市" }
    category { "自然" }
  end
end
```

- [ ] **Step 2: 失敗するテストを書く**

```ruby
# backend/spec/models/spot_spec.rb
require 'rails_helper'

RSpec.describe Spot, type: :model do
  describe 'municipality バリデーション' do
    it '福島県の市町村なら有効' do
      spot = build(:spot, municipality: '会津若松市')
      expect(spot).to be_valid
    end

    it '空なら無効' do
      spot = build(:spot, municipality: nil)
      expect(spot).not_to be_valid
      expect(spot.errors[:municipality]).to include("can't be blank")
    end

    it '福島県の市町村に含まれない値なら無効' do
      spot = build(:spot, municipality: '東京都')
      expect(spot).not_to be_valid
    end
  end
end
```

- [ ] **Step 3: テストを実行して失敗を確認する**

Run: `cd backend && bundle exec rspec spec/models/spot_spec.rb`
Expected: 「空なら無効」「福島県の市町村に含まれない値なら無効」が FAIL（現状バリデーションがないため `be_valid` が true になってしまう）

- [ ] **Step 4: バリデーションを追加する**

`backend/app/models/spot.rb:16-20` を以下に置き換える。

```ruby
  validates :name,         presence: true
  validates :area,         presence: true, inclusion: { in: AREAS }
  validates :municipality, presence: true, inclusion: { in: MunicipalityDetectorService::MUNICIPALITIES }
  validates :category,     presence: true, inclusion: { in: CATEGORIES }
  validates :season,       inclusion: { in: SEASONS }, allow_nil: true
  validates :status,       inclusion: { in: STATUSES }
```

- [ ] **Step 5: テストを実行して成功を確認する**

Run: `cd backend && bundle exec rspec spec/models/spot_spec.rb`
Expected: 3 examples, 0 failures

- [ ] **Step 6: コミットする**

```bash
git add backend/spec/factories/spots.rb backend/spec/models/spot_spec.rb backend/app/models/spot.rb
git commit -m "feat: Spotのmunicipalityに福島県59市町村のバリデーションを追加する"
```

---

### Task 5: Restaurant.municipalityにバリデーションを追加する

**Files:**
- Create: `backend/spec/factories/restaurants.rb`
- Create: `backend/spec/models/restaurant_spec.rb`
- Modify: `backend/app/models/restaurant.rb:18-22`

- [ ] **Step 1: Restaurantのfactoryを作成する**

```ruby
# backend/spec/factories/restaurants.rb
FactoryBot.define do
  factory :restaurant do
    name { "テスト食堂" }
    area { "県中" }
    municipality { "郡山市" }
    category { "和食" }
  end
end
```

- [ ] **Step 2: 失敗するテストを書く**

```ruby
# backend/spec/models/restaurant_spec.rb
require 'rails_helper'

RSpec.describe Restaurant, type: :model do
  describe 'municipality バリデーション' do
    it '福島県の市町村なら有効' do
      restaurant = build(:restaurant, municipality: '会津若松市')
      expect(restaurant).to be_valid
    end

    it '空なら無効' do
      restaurant = build(:restaurant, municipality: nil)
      expect(restaurant).not_to be_valid
      expect(restaurant.errors[:municipality]).to include("can't be blank")
    end

    it '福島県の市町村に含まれない値なら無効' do
      restaurant = build(:restaurant, municipality: '東京都')
      expect(restaurant).not_to be_valid
    end
  end
end
```

- [ ] **Step 3: テストを実行して失敗を確認する**

Run: `cd backend && bundle exec rspec spec/models/restaurant_spec.rb`
Expected: 「空なら無効」「福島県の市町村に含まれない値なら無効」が FAIL

- [ ] **Step 4: バリデーションを追加する**

`backend/app/models/restaurant.rb:18-22` を以下に置き換える。

```ruby
  validates :name,         presence: true
  validates :area,         presence: true, inclusion: { in: AREAS }
  validates :municipality, presence: true, inclusion: { in: MunicipalityDetectorService::MUNICIPALITIES }
  validates :category,     presence: true, inclusion: { in: CATEGORIES }
  validates :status,       inclusion: { in: STATUSES }
  validates :source,       inclusion: { in: SOURCES }
  validates :hotpepper_id, uniqueness: true, allow_nil: true
```

- [ ] **Step 5: テストを実行して成功を確認する**

Run: `cd backend && bundle exec rspec spec/models/restaurant_spec.rb`
Expected: 3 examples, 0 failures

- [ ] **Step 6: コミットする**

```bash
git add backend/spec/factories/restaurants.rb backend/spec/models/restaurant_spec.rb backend/app/models/restaurant.rb
git commit -m "feat: Restaurantのmunicipalityに福島県59市町村のバリデーションを追加する"
```

---

### Task 6: バックエンド全体のRSpec・RuboCopを確認する

**Files:** なし（確認のみ）

- [ ] **Step 1: RSpec全体を実行する**

Run: `cd backend && bundle exec rspec`
Expected: 既存のテスト（personal_event_spec.rb）も含めて全件パス、failures 0

- [ ] **Step 2: RuboCopを実行する**

Run: `cd backend && bundle exec rubocop`
Expected: `no offenses detected`

offenseが出た場合は `bundle exec rubocop -a` で自動修正できるものは修正し、それでも残るものは手動で直す。

- [ ] **Step 3: 修正が発生していればコミットする**

```bash
git add -A
git commit -m "fix: RuboCop指摘を修正する"
```

（修正がなければこのステップはスキップ）

---

### Task 7: フロントエンドのFilterDrawer.tsxに欠落していた3市町村を追加する

**Files:**
- Modify: `frontend/src/components/events/FilterDrawer.tsx:14-37`

調査の結果、`AREA_GROUPS` には福島県59市町村のうち「桑折町」「国見町」「飯舘村」の3件が欠落していた（他は揃っている）。桑折町・国見町は県北エリアのため「中通り」グループに、飯舘村は相双エリアのため「浜通り」グループに追加する。

- [ ] **Step 1: AREA_GROUPSを修正する**

`frontend/src/components/events/FilterDrawer.tsx:12-37` を以下に置き換える。

```typescript
const AREA_GROUPS = [
  {
    label: '中通り',
    areas: [
      '福島市', '二本松市', '伊達市', '本宮市', '桑折町', '国見町', '郡山市', '須賀川市', '田村市', '白河市',
      '大玉村', '川俣町', '三春町', '小野町', '矢吹町', '鏡石町', '天栄村', '西郷村',
      '泉崎村', '中島村', '棚倉町', '矢祭町', '塙町', '鮫川村', '石川町', '玉川村',
      '平田村', '浅川町', '古殿町',
    ],
  },
  {
    label: '浜通り',
    areas: [
      'いわき市', '相馬市', '南相馬市', '広野町', '楢葉町', '富岡町',
      '大熊町', '双葉町', '浪江町', '葛尾村', '川内村', '新地町', '飯舘村',
    ],
  },
  {
    label: '会津',
    areas: [
      '会津若松市', '喜多方市', '会津美里町', '会津坂下町', '北塩原村', '西会津町',
      '磐梯町', '猪苗代町', '湯川村', '柳津町', '三島町', '金山町',
      '只見町', '南会津町', '下郷町', '檜枝岐村', '昭和村',
    ],
  },
]
```

- [ ] **Step 2: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `0 errors, 0 warnings`

- [ ] **Step 3: コミットする**

```bash
git add frontend/src/components/events/FilterDrawer.tsx
git commit -m "fix: イベント検索の地域フィルターに欠落していた3市町村を追加する"
```

---

### Task 8: ローカルで動作確認する

**Files:** なし（手動確認のみ）

`server-start` スキルの手順に従い、Docker（MySQL）・バックエンド（8080）・フロントエンド（3000）を起動する。

- [ ] **Step 1: イベント検索で「会津若松市」が選べて、選ぶと結果が絞り込まれることを確認する**

`http://localhost:3000/events` を開き、絞り込みパネルの「地域」→「会津」→「会津若松市」を選択。Task 3 のマイグレーションで `会津若松市` に再分類した「会津若松 歴史ウォーク」が検索結果に表示されることを確認する。

- [ ] **Step 2: イベント検索で「柳津町」を選ぶと、再分類した10件が表示されることを確認する**

同様に「柳津町」を選択し、霊まつり関連のイベントなどが表示されることを確認する。

- [ ] **Step 3: スポット検索のエリア地図が引き続き正常に動作することを確認する**

`http://localhost:3000/spots` を開き、地図をクリックして市町村を選択し、絞り込みが正常に動作することを確認する（`AreaSelectMap.tsx` は変更していないため、デグレが起きていないことの確認）。

- [ ] **Step 4: デフォルトテーマ・写真テーマの両方で表示崩れがないか確認する**

イベント検索・スポット検索の両画面で、テーマ切り替え後も文字が読めること・レイアウトが崩れていないことを確認する。

---

### Task 9: PRを作成する

**Files:** なし（GitHub操作のみ）

ローカル動作確認が完了し、問題がなければ実行する。

- [ ] **Step 1: ブランチをプッシュする**

```bash
git push -u origin feature/area-unification-#<Issue番号>
```

- [ ] **Step 2: PRを作成する**

```bash
gh pr create --title "feat: エリア区分を福島県59市町村に統一する" --body "$(cat <<'EOF'
## 概要

Event / Spot / Restaurant のエリア値を福島県59市町村に統一した。横断検索UI（Phase 4-B）実装の前提作業。

設計書: docs/specs/2026-06-30-area-unification-design.md

## 変更内容

- Event::AREAS を13市町村+その他から59市町村+オンラインに拡張
- area='その他'だった11件のイベントをデータ修正マイグレーションで正しい市町村に再分類
- Spot.municipality / Restaurant.municipality にバリデーションを追加（データは既に整合済みのため移行不要）
- frontend FilterDrawer.tsx に欠落していた3市町村（桑折町・国見町・飯舘村）を追加

## 確認手順

1. `/events` で「会津若松市」「柳津町」を地域フィルターで選択し、該当イベントが表示されることを確認
2. `/spots` のエリア地図が引き続き正常動作することを確認
3. デフォルトテーマ・写真テーマ両方で表示崩れがないことを確認

Closes #<Issue番号>
EOF
)"
```

- [ ] **Step 3: ユーザーにPRレビューを依頼し、承認後にマージする**

マージは必ずユーザーの確認後に行う（プロジェクトのCLAUDE.mdルール）。マージ後は以下を実行する。

```bash
git checkout main
git pull origin main
git branch -d feature/area-unification-#<Issue番号>
git remote prune origin
```

- [ ] **Step 4: 本番デプロイし、動作確認する**

引き継ぎプロンプートに記載のEC2デプロイ手順を実行し、`http://13.114.226.79` で Task 8 と同じ確認を行う。
