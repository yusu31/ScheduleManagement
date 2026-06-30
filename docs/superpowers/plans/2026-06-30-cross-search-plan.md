# 横断検索UI 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** イベント・観光スポット・グルメをキーワード＋エリアで横断的に検索できるUIを追加する。

**Architecture:** 全ページ共通のSidebarに検索ボックスを追加し、`/search?q=...&municipalities[]=...` という新規ページに遷移する。`/search`ページは既存の3つのAPI（events/spots/restaurants）を同じ条件で並列に呼び出し、各上位5件を既存のカードコンポーネントでセクション表示する。新しい統合APIは作らず、Spot/Restaurantの既存コントローラーに `municipalities[]` フィルタを追加するだけに留める。「もっと見る」リンクで条件を引き継いで各専用ページに遷移できるよう、events/spots/restaurantsの3ページにURL初期値の読み込みを追加する。

**Tech Stack:** Ruby on Rails 7.2（APIモード）/ RSpec / Next.js（App Router）/ TypeScript / ESLint

**設計書:** [docs/specs/2026-06-30-cross-search-design.md](../../specs/2026-06-30-cross-search-design.md)

---

## 前提知識（初めて触る人向け）

- `events_controller.rb` は `areas[]` パラメータを `events.where(area: params[:areas])` のようにActiveRecordに渡している。配列を渡すと自動的にSQLの `IN (...)` 句になる（Railsの機能）。今回追加する `municipalities[]` も同じ仕組みを使う。
- Next.jsの `useSearchParams()` フックを使うコンポーネントは `<Suspense>` で包む必要がある（Next.jsの仕様）。`events/page.tsx` が既にこのパターンを使っているので、`spots/page.tsx` と `restaurants/page.tsx` にも同じパターンを適用する。
- `apiClient`（`frontend/src/lib/axios.ts`）はaxiosのラッパーで、認証ヘッダーを自動付与する。`apiClient.get('/api/v1/xxx?...')` の形で使う。
- 作業前に必ずGitHub Issueを作成し、ブランチを切ってから実装する（プロジェクトのCLAUDE.mdのルール）。

---

### Task 1: Issue作成・ブランチ作成

**Files:** なし（GitHub操作のみ）

- [ ] **Step 1: Issueを作成する**

```bash
gh issue create --title "feat: イベント・スポット・グルメの横断検索UIを追加する" --label enhancement --body "$(cat <<'EOF'
## 背景・目的

イベント・観光スポット・グルメをキーワード＋エリアで横断的に検索できるUIを追加する。
設計書: docs/specs/2026-06-30-cross-search-design.md

## 変更内容

- [ ] spots_controller.rb / restaurants_controller.rb に municipalities[] フィルタを追加
- [ ] AREA_GROUPS を frontend/src/constants/areas.ts に共通化
- [ ] Sidebar.tsx に検索ボックスを追加
- [ ] /search ページを新規実装
- [ ] events/spots/restaurants の各ページにURL初期値読み込みを追加（もっと見る連携用）

## 完了条件

- [ ] RuboCop 0 offenses / RSpec 全テストパス
- [ ] ESLint 0 errors / 0 warnings
- [ ] ローカルで検索→結果表示→もっと見る遷移までの一連の動作を確認
EOF
)"
```

Issue番号（例: `#170`）を控えておく。以降 `<Issue番号>` はこの番号に置き換える。

- [ ] **Step 2: ブランチを作成する**

```bash
cd c:/Users/3fort/RaiseTech/EventFinder
git checkout main
git pull origin main
git checkout -b feature/cross-search-#<Issue番号>
```

---

### Task 2: バックエンド - spots_controller.rbにmunicipalities[]フィルタを追加

**Files:**
- Create: `backend/spec/requests/api/v1/spots_spec.rb`
- Modify: `backend/app/controllers/api/v1/spots_controller.rb:6-17`

- [ ] **Step 1: 失敗するリクエストスペックを書く**

```ruby
# backend/spec/requests/api/v1/spots_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::Spots', type: :request do
  describe 'GET /api/v1/spots' do
    let!(:aizu_spot)    { create(:spot, name: '鶴ヶ城',     municipality: '会津若松市') }
    let!(:koriyama_spot) { create(:spot, name: '郡山公園',  municipality: '郡山市') }

    it 'municipalities[] を指定すると該当する市町村のスポットのみ返す' do
      get '/api/v1/spots', params: { municipalities: [ '会津若松市' ] }

      body = JSON.parse(response.body)
      names = body.map { |s| s['name'] }

      expect(names).to include('鶴ヶ城')
      expect(names).not_to include('郡山公園')
    end

    it 'municipalities[] を指定しなければ全件返す' do
      get '/api/v1/spots'

      body = JSON.parse(response.body)
      names = body.map { |s| s['name'] }

      expect(names).to include('鶴ヶ城', '郡山公園')
    end
  end
end
```

- [ ] **Step 2: テストを実行して失敗を確認する**

Run: `cd backend && bundle exec rspec spec/requests/api/v1/spots_spec.rb`
Expected: 1つ目のテストがFAIL（`municipalities[]` パラメータが無視され、郡山公園も結果に含まれてしまうため）

- [ ] **Step 3: フィルタを追加する**

`backend/app/controllers/api/v1/spots_controller.rb` の `index` アクション（6〜17行目）を以下に置き換える。

```ruby
      def index
        spots = Spot.published
        spots = spots.where(area: params[:area])                 if params[:area].present?
        spots = spots.where(municipality: params[:municipalities]) if params[:municipalities].present?
        spots = spots.where(category: params[:category])         if params[:category].present?
        spots = spots.where(season: params[:season])             if params[:season].present?
        if params[:q].present?
          keyword = "%#{params[:q]}%"
          spots = spots.where("name LIKE ? OR description LIKE ?", keyword, keyword)
        end
        spots = spots.order(created_at: :desc)
        render json: spots
      end
```

- [ ] **Step 4: テストを実行して成功を確認する**

Run: `cd backend && bundle exec rspec spec/requests/api/v1/spots_spec.rb`
Expected: 2 examples, 0 failures

- [ ] **Step 5: RuboCopを確認する**

Run: `cd backend && bundle exec rubocop app/controllers/api/v1/spots_controller.rb spec/requests/api/v1/spots_spec.rb`
Expected: no offenses detected

- [ ] **Step 6: コミットする**

```bash
git add backend/app/controllers/api/v1/spots_controller.rb backend/spec/requests/api/v1/spots_spec.rb
git commit -m "feat: spots APIにmunicipalities[]によるエリア絞り込みを追加する"
```

---

### Task 3: バックエンド - restaurants_controller.rbにmunicipalities[]フィルタを追加

**Files:**
- Create: `backend/spec/requests/api/v1/restaurants_spec.rb`
- Modify: `backend/app/controllers/api/v1/restaurants_controller.rb:6-16`

- [ ] **Step 1: 失敗するリクエストスペックを書く**

```ruby
# backend/spec/requests/api/v1/restaurants_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::Restaurants', type: :request do
  describe 'GET /api/v1/restaurants' do
    let!(:aizu_restaurant)    { create(:restaurant, name: '会津食堂',   municipality: '会津若松市') }
    let!(:koriyama_restaurant) { create(:restaurant, name: '郡山食堂', municipality: '郡山市') }

    it 'municipalities[] を指定すると該当する市町村のグルメのみ返す' do
      get '/api/v1/restaurants', params: { municipalities: [ '会津若松市' ] }

      body = JSON.parse(response.body)
      names = body.map { |r| r['name'] }

      expect(names).to include('会津食堂')
      expect(names).not_to include('郡山食堂')
    end

    it 'municipalities[] を指定しなければ全件返す' do
      get '/api/v1/restaurants'

      body = JSON.parse(response.body)
      names = body.map { |r| r['name'] }

      expect(names).to include('会津食堂', '郡山食堂')
    end
  end
end
```

- [ ] **Step 2: テストを実行して失敗を確認する**

Run: `cd backend && bundle exec rspec spec/requests/api/v1/restaurants_spec.rb`
Expected: 1つ目のテストがFAIL

- [ ] **Step 3: フィルタを追加する**

`backend/app/controllers/api/v1/restaurants_controller.rb` の `index` アクション（6〜16行目）を以下に置き換える。

```ruby
      def index
        restaurants = Restaurant.published
        restaurants = restaurants.by_area(params[:area])                       if params[:area].present?
        restaurants = restaurants.where(municipality: params[:municipalities]) if params[:municipalities].present?
        restaurants = restaurants.by_category(params[:category])               if params[:category].present?
        if params[:q].present?
          keyword = "%#{params[:q]}%"
          restaurants = restaurants.where("name LIKE ? OR description LIKE ? OR address LIKE ?", keyword, keyword, keyword)
        end
        restaurants = restaurants.order(created_at: :desc)
        render json: restaurants
      end
```

- [ ] **Step 4: テストを実行して成功を確認する**

Run: `cd backend && bundle exec rspec spec/requests/api/v1/restaurants_spec.rb`
Expected: 2 examples, 0 failures

- [ ] **Step 5: RuboCopを確認する**

Run: `cd backend && bundle exec rubocop app/controllers/api/v1/restaurants_controller.rb spec/requests/api/v1/restaurants_spec.rb`
Expected: no offenses detected

- [ ] **Step 6: コミットする**

```bash
git add backend/app/controllers/api/v1/restaurants_controller.rb backend/spec/requests/api/v1/restaurants_spec.rb
git commit -m "feat: restaurants APIにmunicipalities[]によるエリア絞り込みを追加する"
```

---

### Task 4: バックエンド全体のRSpec・RuboCop確認

**Files:** なし（確認のみ）

- [ ] **Step 1: RSpec全体を実行する**

Run: `cd backend && bundle exec rspec`
Expected: 全テストパス（failures 0）

- [ ] **Step 2: RuboCopを実行する**

Run: `cd backend && bundle exec rubocop`
Expected: no offenses detected

---

### Task 5: フロントエンド - AREA_GROUPSを共通定数ファイルに切り出す

**Files:**
- Create: `frontend/src/constants/areas.ts`
- Modify: `frontend/src/components/events/FilterDrawer.tsx:1-37`

- [ ] **Step 1: 共通定数ファイルを作成する**

```typescript
// frontend/src/constants/areas.ts
export const AREA_GROUPS = [
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

- [ ] **Step 2: FilterDrawer.tsxから重複定義を削除し、共通ファイルを参照する**

`frontend/src/components/events/FilterDrawer.tsx` の1〜37行目を以下に置き換える（`import`文を追加し、ハードコードされていた`AREA_GROUPS`の定義を削除する）。

```typescript
'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { AREA_GROUPS } from '@/constants/areas'

const CATEGORIES = [
  'テクノロジー', '音楽', 'スポーツ', '自然・アウトドア',
  '食・グルメ', '文化・伝統', 'ファミリー', '教育', '祭り・イベント', 'アート', 'その他',
]
```

- [ ] **Step 3: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `FilterDrawer.tsx` / `areas.ts` に起因するエラー・警告がないこと

- [ ] **Step 4: 動作確認（手動）**

`npm run dev` で起動し、`/events` ページの絞り込みパネルを開いて、地域チップが今まで通り表示されることを目視確認する。

- [ ] **Step 5: コミットする**

```bash
git add frontend/src/constants/areas.ts frontend/src/components/events/FilterDrawer.tsx
git commit -m "refactor: 福島県59市町村のグループ分けリストをconstants/areas.tsに共通化する"
```

---

### Task 6: フロントエンド - AreaChipFilterコンポーネントを新規作成

**Files:**
- Create: `frontend/src/components/search/AreaChipFilter.tsx`

- [ ] **Step 1: コンポーネントを作成する**

```typescript
// frontend/src/components/search/AreaChipFilter.tsx
'use client'

import { AREA_GROUPS } from '@/constants/areas'

type Props = {
  selected: string[]
  onToggle: (municipality: string) => void
}

export default function AreaChipFilter({ selected, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {AREA_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[11px] font-bold text-app-sub/60 mb-1.5 tracking-wide">{group.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {group.areas.map(area => (
              <button
                key={area}
                type="button"
                onClick={() => onToggle(area)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                  selected.includes(area)
                    ? 'bg-primary text-white'
                    : 'bg-app-bg text-app-sub hover:bg-app-border'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `AreaChipFilter.tsx` に起因するエラー・警告がないこと（この時点ではどこからもimportされていないため、未使用コンポーネントとしてのエラーは出ない）

- [ ] **Step 3: コミットする**

```bash
git add frontend/src/components/search/AreaChipFilter.tsx
git commit -m "feat: エリアチップ絞り込みコンポーネントを新規作成する"
```

---

### Task 7: フロントエンド - /searchページを新規作成

**Files:**
- Create: `frontend/src/app/search/page.tsx`

- [ ] **Step 1: ページを作成する**

```typescript
// frontend/src/app/search/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'
import { Spot } from '@/types/spot'
import { Restaurant } from '@/types/restaurant'
import EventCard from '@/components/events/EventCard'
import SpotCard from '@/components/spots/SpotCard'
import RestaurantCard from '@/components/gourmet/RestaurantCard'
import AreaChipFilter from '@/components/search/AreaChipFilter'
import toast from 'react-hot-toast'

const RESULT_LIMIT = 5

function SearchInner() {
  const searchParams = useSearchParams()
  const [q] = useState(searchParams.get('q') ?? '')
  const [municipalities, setMunicipalities] = useState<string[]>(searchParams.getAll('municipalities[]'))
  const [events, setEvents] = useState<Event[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const toggleMunicipality = (m: string) => {
    setMunicipalities(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [ ...prev, m ]))
  }

  useEffect(() => {
    setIsLoading(true)

    const eventsParams = new URLSearchParams()
    if (q) eventsParams.set('q', q)
    municipalities.forEach(m => eventsParams.append('areas[]', m))
    eventsParams.set('per_page', String(RESULT_LIMIT))

    const spotsParams = new URLSearchParams()
    if (q) spotsParams.set('q', q)
    municipalities.forEach(m => spotsParams.append('municipalities[]', m))

    const restaurantsParams = new URLSearchParams()
    if (q) restaurantsParams.set('q', q)
    municipalities.forEach(m => restaurantsParams.append('municipalities[]', m))

    Promise.all([
      apiClient.get(`/api/v1/events?${eventsParams.toString()}`),
      apiClient.get(`/api/v1/spots?${spotsParams.toString()}`),
      apiClient.get(`/api/v1/restaurants?${restaurantsParams.toString()}`),
    ])
      .then(([ eventsRes, spotsRes, restaurantsRes ]) => {
        setEvents(eventsRes.data.events)
        setSpots(spotsRes.data.slice(0, RESULT_LIMIT))
        setRestaurants(restaurantsRes.data.slice(0, RESULT_LIMIT))
      })
      .catch(() => toast.error('検索結果の読み込みに失敗しました'))
      .finally(() => setIsLoading(false))
  }, [ q, municipalities ])

  const moreLinkQuery = (areaParamName: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    municipalities.forEach(m => params.append(`${areaParamName}[]`, m))
    return params.toString()
  }

  return (
    <div className="min-h-screen px-8 py-8 max-w-[1160px] mx-auto">
      <h1 className="text-[20px] font-bold text-app-text mb-1">「{q || '全件'}」の検索結果</h1>
      <p className="text-[13px] text-app-sub mb-5">イベント・スポット・グルメをまとめて検索します</p>

      <div className="mb-8 p-4 rounded-2xl bg-white/70 border border-app-border">
        <AreaChipFilter selected={municipalities} onToggle={toggleMunicipality} />
      </div>

      {isLoading ? (
        <p className="text-[13px] text-app-sub">読み込み中...</p>
      ) : (
        <>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-app-text">イベント</h2>
              <Link href={`/events?${moreLinkQuery('areas')}`} className="text-[13px] text-primary font-semibold hover:underline">もっと見る →</Link>
            </div>
            {events.length === 0 ? (
              <p className="text-[13px] text-app-sub">該当するイベントはありませんでした</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-x-[24px] gap-y-[20px]">
                {events.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            )}
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-app-text">観光スポット</h2>
              <Link href={`/spots?${moreLinkQuery('municipalities')}`} className="text-[13px] text-primary font-semibold hover:underline">もっと見る →</Link>
            </div>
            {spots.length === 0 ? (
              <p className="text-[13px] text-app-sub">該当する観光スポットはありませんでした</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-x-[24px] gap-y-[20px]">
                {spots.map(s => <SpotCard key={s.id} spot={s} />)}
              </div>
            )}
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-app-text">グルメ</h2>
              <Link href={`/restaurants?${moreLinkQuery('municipalities')}`} className="text-[13px] text-primary font-semibold hover:underline">もっと見る →</Link>
            </div>
            {restaurants.length === 0 ? (
              <p className="text-[13px] text-app-sub">該当するグルメ情報はありませんでした</p>
            ) : (
              <div className="flex flex-col gap-3">
                {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  )
}
```

- [ ] **Step 2: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `search/page.tsx` に起因するエラー・警告がないこと

- [ ] **Step 3: コミットする**

```bash
git add frontend/src/app/search/page.tsx
git commit -m "feat: 横断検索結果ページ（/search）を新規実装する"
```

---

### Task 8: フロントエンド - Sidebar.tsxに検索ボックスを追加

**Files:**
- Modify: `frontend/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: importを追加する**

`frontend/src/components/layout/Sidebar.tsx:1-11` を以下に置き換える（`Search`アイコン、`useState`の追加、`useRouter`のimportを追加）。

```typescript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Sun, CalendarRange, Ticket, Sprout, MapPin, Trophy, Palette, Shield, Landmark, Utensils, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useUserPreference } from '@/contexts/UserPreferenceContext'
import UserProfilePanel from '@/components/user/UserProfilePanel'
```

- [ ] **Step 2: 検索用stateとルーターを追加する**

`frontend/src/components/layout/Sidebar.tsx:25-31`（`export default function Sidebar() {` から最初の `useEffect` まで）を以下に置き換える。

```typescript
export default function Sidebar() {
  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [themeBg, setThemeBg] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => setMounted(true), [])
```

- [ ] **Step 3: 検索ボックスをロゴ直下・ナビ直上に追加する**

`frontend/src/components/layout/Sidebar.tsx` のロゴ部分（74〜83行目）と、ナビゲーション開始のコメント（85行目 `{/* ナビゲーション */}`）の間に、以下を追加する。

```typescript
      {/* 検索ボックス */}
      <div className="px-5 pb-3">
        <form
          onSubmit={e => {
            e.preventDefault()
            if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
          }}
          className="relative"
        >
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${usesDarkOverlay ? 'text-white/50' : 'text-app-sub'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="イベント・スポット・グルメを検索"
            className={`
              w-full pl-9 pr-3 py-2 rounded-xl text-[12px] outline-none transition-colors
              ${usesDarkOverlay
                ? 'bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15'
                : 'bg-white/60 text-app-text placeholder:text-app-sub/60 focus:bg-white'
              }
            `}
          />
        </form>
      </div>
```

- [ ] **Step 4: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `Sidebar.tsx` に起因するエラー・警告がないこと

- [ ] **Step 5: 動作確認（手動）**

`npm run dev` で起動し、どのページからでもSidebarの検索ボックスにキーワードを入力してEnterを押すと `/search?q=キーワード` に遷移することを確認する。

- [ ] **Step 6: コミットする**

```bash
git add frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: Sidebarに全ページ共通の検索ボックスを追加する"
```

---

### Task 9: フロントエンド - events/page.tsxにURL初期値読み込みを追加

**Files:**
- Modify: `frontend/src/app/events/page.tsx:106-120`

「もっと見る」で `/events?q=...&areas[]=...` に遷移したときに、その条件が初期状態として反映されるようにする。

- [ ] **Step 1: 初期state読み込みを変更する**

`frontend/src/app/events/page.tsx:106-120` を以下に置き換える（`searchParams` の宣言を先頭に移動し、`search`・`areas` の初期値をURLから読み込むようにする）。

```typescript
  const searchParams = useSearchParams()
  const [events,     setEvents]     = useState<Event[]>([])
  const [meta,       setMeta]       = useState<Meta>({ total_count: 0, total_pages: 1, current_page: 1, per_page: PER_PAGE })
  const [isLoading,  setIsLoading]  = useState(true)
  const [search,     setSearch]     = useState(searchParams.get('q') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') ?? '')
  const [areas,      setAreas]      = useState<string[]>(searchParams.getAll('areas[]'))
  const [categories, setCategories] = useState<string[]>([])
  const [tags,       setTags]       = useState<string[]>([])
  const [page,       setPage]       = useState(1)
  const [showPast,   setShowPast]   = useState(false)
  const [tab,        setTab]        = useState<'all' | 'favorites'>(
    searchParams.get('tab') === 'favorites' ? 'favorites' : 'all'
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
```

- [ ] **Step 2: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `events/page.tsx` に起因するエラー・警告がないこと（`searchParams` の重複宣言エラーが出ないことを確認する）

- [ ] **Step 3: 動作確認（手動）**

ブラウザで `http://localhost:3000/events?q=会津若松&areas[]=会津若松市` に直接アクセスし、検索ボックスに「会津若松」、地域フィルターに「会津若松市」が反映された状態で表示されることを確認する。

- [ ] **Step 4: コミットする**

```bash
git add frontend/src/app/events/page.tsx
git commit -m "feat: イベント検索ページでURLのq・areas[]パラメータを初期値として読み込む"
```

---

### Task 10: フロントエンド - spots/page.tsxにURL初期値読み込みを追加

**Files:**
- Modify: `frontend/src/app/spots/page.tsx`

- [ ] **Step 1: importとSuspense対応を追加する**

`frontend/src/app/spots/page.tsx:1-11` を以下に置き換える。

```typescript
'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/axios'
import { Spot } from '@/types/spot'
import SpotCard from '@/components/spots/SpotCard'
import AreaSelectMap from '@/components/ui/AreaSelectMap'
import SpotFilterDrawer from '@/components/spots/SpotFilterDrawer'
import toast from 'react-hot-toast'
```

- [ ] **Step 2: コンポーネント名をSpotsInnerに変更し、URL初期値を読み込む**

`frontend/src/app/spots/page.tsx:42-50`（`export default function SpotsPage() {` から `drawerOpen` の宣言まで）を以下に置き換える。

```typescript
function SpotsInner() {
  const searchParams = useSearchParams()
  const [spots, setSpots] = useState<Spot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>(searchParams.getAll('municipalities[]'))
  const [categories, setCategories] = useState<string[]>([])
  const [season, setSeason] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
```

- [ ] **Step 3: ファイル末尾にSuspenseでラップしたデフォルトエクスポートを追加する**

ファイル末尾（現在 `export default function SpotsPage() {` の閉じ括弧で終わっている部分）の直後に、以下を追加する。

```typescript
export default function SpotsPage() {
  return (
    <Suspense>
      <SpotsInner />
    </Suspense>
  )
}
```

- [ ] **Step 4: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `spots/page.tsx` に起因するエラー・警告がないこと

- [ ] **Step 5: 動作確認（手動）**

ブラウザで `http://localhost:3000/spots?q=城&municipalities[]=会津若松市` に直接アクセスし、検索キーワード「城」・市町村「会津若松市」で絞り込まれた状態で表示されることを確認する。

- [ ] **Step 6: コミットする**

```bash
git add frontend/src/app/spots/page.tsx
git commit -m "feat: スポット検索ページでURLのq・municipalities[]パラメータを初期値として読み込む"
```

---

### Task 11: フロントエンド - restaurants/page.tsxにURL初期値読み込みを追加

**Files:**
- Modify: `frontend/src/app/restaurants/page.tsx`

- [ ] **Step 1: importとSuspense対応を追加する**

`frontend/src/app/restaurants/page.tsx:1-14` を以下に置き換える。

```typescript
'use client'

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal, X, ChevronDown,
  UtensilsCrossed, Beef, Soup, Coffee, ChefHat, Tag, Wheat, Flame, Wine,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/axios'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/gourmet/RestaurantCard'
import RestaurantFilterDrawer from '@/components/gourmet/RestaurantFilterDrawer'
import toast from 'react-hot-toast'
```

- [ ] **Step 2: コンポーネント名をRestaurantsInnerに変更し、URL初期値を読み込む**

`frontend/src/app/restaurants/page.tsx:72-79`（`export default function RestaurantsPage() {` から `municipalities` の宣言まで）を以下に置き換える。

```typescript
function RestaurantsInner() {
  const searchParams = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>(searchParams.getAll('municipalities[]'))
```

- [ ] **Step 3: ファイル末尾にSuspenseでラップしたデフォルトエクスポートを追加する**

ファイル末尾（現在 `export default function RestaurantsPage() {` の閉じ括弧で終わっている部分）の直後に、以下を追加する。

```typescript
export default function RestaurantsPage() {
  return (
    <Suspense>
      <RestaurantsInner />
    </Suspense>
  )
}
```

- [ ] **Step 4: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: `restaurants/page.tsx` に起因するエラー・警告がないこと

- [ ] **Step 5: 動作確認（手動）**

ブラウザで `http://localhost:3000/restaurants?q=ラーメン&municipalities[]=郡山市` に直接アクセスし、絞り込まれた状態で表示されることを確認する。

- [ ] **Step 6: コミットする**

```bash
git add frontend/src/app/restaurants/page.tsx
git commit -m "feat: グルメ検索ページでURLのq・municipalities[]パラメータを初期値として読み込む"
```

---

### Task 12: フロントエンド全体のESLint確認

**Files:** なし（確認のみ）

- [ ] **Step 1: ESLintを実行する**

Run: `cd frontend && npm run lint`
Expected: 0 errors, 0 warnings（既知の `admin/ai-import/page.tsx` の `<img>` warning以外に新たな警告がないこと）

---

### Task 13: ローカルで動作確認する

**Files:** なし（手動確認のみ）

`server-start` スキルの手順に従い、Docker（MySQL）・バックエンド（8080）・フロントエンド（3000）を起動する。

- [ ] **Step 1: 検索ボックスからの一連の流れを確認する**

任意のページ（例: `/today`）のSidebarにある検索ボックスに「会津若松」と入力しEnter。`/search?q=会津若松` に遷移し、イベント・スポット・グルメの3セクションが表示され、該当する結果（観光スポット「鶴ヶ城」等）が出ることを確認する。

- [ ] **Step 2: エリアチップでの絞り込みを確認する**

`/search` ページ上部のエリアチップで「柳津町」を選択し、結果が柳津町関連のイベントに絞り込まれることを確認する。

- [ ] **Step 3: 「もっと見る」遷移を確認する**

イベントセクションの「もっと見る」を押し、`/events` に同じキーワード・エリア条件が反映された状態で遷移することを確認する。スポット・グルメも同様に確認する。

- [ ] **Step 4: 該当0件のセクション表示を確認する**

存在しないキーワード（例: 「xyz123」）で検索し、3セクションとも「該当なし」の表示になることを確認する。

- [ ] **Step 5: デフォルトテーマ・写真テーマの両方で表示を確認する**

Sidebarの検索ボックス・`/search` ページのテキストが、デフォルトテーマ・写真テーマの両方で読めることを確認する。

---

### Task 14: PRを作成する

**Files:** なし（GitHub操作のみ）

ローカル動作確認が完了し、問題がなければ実行する。

- [ ] **Step 1: ブランチをプッシュする**

```bash
git push -u origin feature/cross-search-#<Issue番号>
```

- [ ] **Step 2: PRを作成する**

```bash
gh pr create --title "feat: イベント・スポット・グルメの横断検索UIを追加する" --body "$(cat <<'EOF'
## 概要

イベント・観光スポット・グルメをキーワード＋エリアで横断的に検索できるUIを追加した。

設計書: docs/specs/2026-06-30-cross-search-design.md
実装計画: docs/superpowers/plans/2026-06-30-cross-search-plan.md

## 変更内容

- Sidebarに全ページ共通の検索ボックスを追加
- 横断検索結果ページ（/search）を新規実装。イベント・スポット・グルメを上位5件ずつセクション表示
- spots_controller.rb / restaurants_controller.rb に municipalities[] エリア絞り込みを追加
- 福島県59市町村のグループ分けリストを frontend/src/constants/areas.ts に共通化
- events/spots/restaurants の各ページが、もっと見るリンクからの遷移時にURLのq・エリア条件を初期値として反映するよう対応

## 確認手順

1. Sidebarの検索ボックスで「会津若松」を検索し、3セクションに結果が表示されることを確認
2. /search のエリアチップで絞り込みができることを確認
3. もっと見るで /events, /spots, /restaurants に条件が引き継がれることを確認
4. デフォルトテーマ・写真テーマ両方で表示崩れがないことを確認

Closes #<Issue番号>
EOF
)"
```

- [ ] **Step 3: ユーザーにPRレビューを依頼し、承認後にマージする**

マージは必ずユーザーの確認後に行う。マージ後は以下を実行する。

```bash
git checkout main
git pull origin main
git branch -d feature/cross-search-#<Issue番号>
git remote prune origin
```

- [ ] **Step 4: 本番デプロイし、動作確認する**

EC2デプロイ手順を実行し、`http://13.114.226.79` で Task 13 と同じ確認を行う。
