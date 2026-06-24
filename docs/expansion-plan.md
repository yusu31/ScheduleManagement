# 拡張計画書 — スポット・グルメ・AI機能

| 項目 | 内容 |
|------|------|
| 作成日 | 2026-06-24 |
| バージョン | 1.0 |
| 作成者 | yusu |
| ステータス | 実装中 |

---

## 改訂履歴

| バージョン | 日付 | 変更者 | 変更内容 |
|-----------|------|--------|---------|
| 1.0 | 2026-06-24 | yusu | 初版作成 |

---

## 1. 概要・背景

2026年6月時点でイベント・カレンダー・マップ制覇の基本機能実装が完了した。

次フェーズでは「ふくしまの旅（tif.ne.jp）」を参考に、以下を追加して
**福島の地域情報ポータル**へと機能を拡充する。

- 観光スポット情報の閲覧
- グルメ（飲食店）情報の閲覧
- AIチャットによるおでかけ提案
- イベント検索 UX の改善

---

## 2. 追加機能一覧

| # | 機能名 | 外部 API | 優先度 | Phase |
|---|--------|---------|-------|-------|
| EX-01 | 予定ページ廃止・カレンダー統合 | なし | 最高 | 0 |
| EX-02 | 観光スポット一覧・詳細 | なし（手動登録） | 高 | 1 |
| EX-03 | エリア SVG マップ選択 | なし | 高 | 1 |
| EX-04 | グルメ情報（HotPepper API） | HotPepper グルメ API | 高 | 2 |
| EX-05 | AI チャットボット | Google Gemini API | 高 | 3 |
| EX-06 | クイック日程フィルター | なし | 中 | 4 |
| EX-07 | 季節フィルター（春夏秋冬） | なし | 中 | 4 |
| EX-08 | ホームページ強化 | なし | 中 | 5 |

---

## 3. データベース設計

### 3-1. 新規テーブル: spots（観光スポット）

```sql
CREATE TABLE spots (
  id             BIGINT       PRIMARY KEY AUTO_INCREMENT,
  name           VARCHAR(255) NOT NULL,           -- スポット名
  description    TEXT,                            -- 説明文
  area           VARCHAR(50)  NOT NULL,           -- エリア区分
  municipality   VARCHAR(100),                    -- 市区町村
  address        VARCHAR(255),                    -- 住所
  category       VARCHAR(50)  NOT NULL,           -- カテゴリ
  season         VARCHAR(20)  DEFAULT 'all',      -- おすすめ季節
  latitude       DECIMAL(10,7),                   -- 緯度
  longitude      DECIMAL(10,7),                   -- 経度
  image_url      VARCHAR(500),                    -- 画像URL
  official_url   VARCHAR(500),                    -- 公式サイトURL
  phone          VARCHAR(20),                     -- 電話番号
  opening_hours  VARCHAR(255),                    -- 営業時間
  access         VARCHAR(255),                    -- アクセス情報
  admission_fee  VARCHAR(255),                    -- 入場料
  source         VARCHAR(20)  DEFAULT 'manual',   -- データソース
  status         VARCHAR(20)  DEFAULT 'published',-- 公開状態
  created_at     DATETIME     NOT NULL,
  updated_at     DATETIME     NOT NULL
);
```

**area の選択肢**（福島県7エリア）

| 値 | 表示名 | 主な市町村 |
|----|-------|----------|
| 県北 | 県北エリア | 福島市・伊達市・桑折町 |
| 県中 | 県中エリア | 郡山市・本宮市・三春町 |
| 県南 | 県南エリア | 白河市・矢吹町・天栄村 |
| 会津 | 会津エリア | 会津若松市・喜多方市 |
| 南会津 | 南会津エリア | 南会津町・只見町 |
| いわき | いわきエリア | いわき市 |
| 相双 | 相双エリア | 南相馬市・相馬市 |

**category の選択肢**

`自然` / `歴史・文化` / `温泉` / `テーマパーク` / `体験・アクティビティ` / `道の駅` / `その他`

**season の選択肢**

`spring`（3〜5月）/ `summer`（6〜8月）/ `autumn`（9〜11月）/ `winter`（12〜2月）/ `all`（通年）

### 3-2. restaurants テーブルは作らない

HotPepper API はリアルタイム取得のみで実装し、DB には保存しない。

**理由：** 飲食店情報は営業状況・メニューが頻繁に変わるため、
キャッシュよりリアルタイム取得の方がユーザーに正確な情報を届けられる。

---

## 4. API 設計

### 4-1. 観光スポット API

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | `/api/v1/spots` | 一覧取得（フィルター対応） | 不要 |
| GET | `/api/v1/spots/:id` | 詳細取得 | 不要 |
| GET | `/api/v1/admin/spots` | 管理者用一覧 | 管理者のみ |
| POST | `/api/v1/admin/spots` | 新規作成 | 管理者のみ |
| PATCH | `/api/v1/admin/spots/:id` | 更新 | 管理者のみ |
| DELETE | `/api/v1/admin/spots/:id` | 削除 | 管理者のみ |

**GET /api/v1/spots のクエリパラメータ**

| パラメータ | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| `area` | string | エリアで絞り込み | `?area=県中` |
| `category` | string | カテゴリで絞り込み | `?category=温泉` |
| `season` | string | 季節で絞り込み | `?season=summer` |
| `q` | string | キーワード検索（name/description） | `?q=鶴ヶ城` |

**レスポンス例（GET /api/v1/spots）**

```json
[
  {
    "id": 1,
    "name": "鶴ヶ城",
    "description": "会津のシンボル。桜の名所としても有名。",
    "area": "会津",
    "municipality": "会津若松市",
    "address": "福島県会津若松市追手町1-1",
    "category": "歴史・文化",
    "season": "spring",
    "latitude": 37.4944,
    "longitude": 139.9301,
    "image_url": "https://...",
    "official_url": "https://...",
    "admission_fee": "大人410円",
    "opening_hours": "8:30〜17:00",
    "access": "会津若松駅からバス15分"
  }
]
```

### 4-2. グルメ API（HotPepper プロキシ）

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | `/api/v1/restaurants` | HotPepper 検索結果を返す | 不要 |

**クエリパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `area` | string | エリア名（Roami の area 区分） |
| `genre` | string | ジャンル（和食・洋食・ラーメン等） |
| `keyword` | string | キーワード検索 |
| `count` | integer | 取得件数（デフォルト 20） |

**処理フロー**

```
フロント → GET /api/v1/restaurants?area=県中
  → Rails が area を HotPepper エリアコードに変換
  → HotPepper API を叩く
  → 結果を整形してフロントに返す
```

**エリア → HotPepper コード対応表**

| Roami area | HotPepper コード |
|-----------|----------------|
| 県北 | Z011（福島市周辺） |
| 県中 | Z011（郡山市周辺） |
| 会津 | Z011（会津若松市周辺） |
| いわき | Z011（いわき市周辺） |

> ※ HotPepper の詳細エリアコードは API ドキュメントで確認する

### 4-3. AI チャット API

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | `/api/v1/ai/chat` | チャットメッセージを送信・返答を受け取る | 不要 |

**リクエストボディ**

```json
{
  "message": "今週末おすすめのイベントは？"
}
```

**レスポンス**

```json
{
  "reply": "今週末の郡山市では○○が開催されます。会津エリアでは..."
}
```

**コンテキスト設計**

Gemini API に渡すシステムプロンプトには以下を含める：

1. Roami のサービス説明（福島の地域情報ポータル）
2. 今後30日以内に開催予定のイベント（DB から取得）
3. 公開中の観光スポット一覧（DB から取得）
4. ユーザーの質問

---

## 5. フロントエンド構成

### 5-1. 新規ページ

| URL | ファイル | 説明 |
|-----|---------|------|
| `/spots` | `app/spots/page.tsx` | 観光スポット一覧 |
| `/spots/[id]` | `app/spots/[id]/page.tsx` | 観光スポット詳細 |
| `/restaurants` | `app/restaurants/page.tsx` | グルメ一覧 |

### 5-2. 新規コンポーネント

| コンポーネント | ファイル | 説明 |
|-------------|---------|------|
| SpotCard | `components/spots/SpotCard.tsx` | スポットカード |
| SpotFilterDrawer | `components/spots/SpotFilterDrawer.tsx` | スポット絞り込みドロワー |
| AreaSelectMap | `components/ui/AreaSelectMap.tsx` | エリア SVG マップ（conquer の FukushimaMap を参考に作成） |
| ChatWidget | `components/ai/ChatWidget.tsx` | AI チャットウィジェット（全ページ共通・フローティング） |
| RestaurantCard | `components/restaurants/RestaurantCard.tsx` | グルメカード |
| QuickDateFilter | `components/events/QuickDateFilter.tsx` | 今日/明日/今週末/今月 クイックフィルター |

### 5-3. 削除するページ

| URL | 理由 |
|-----|------|
| `/personal-events` | カレンダーページの「一覧」ビューに統合（EX-01） |

### 5-4. サイドバー構成（変更後）

**変更前**

```
今日 / 予定 / カレンダー / イベント / お気に入り / マップ / 制覇
```

**変更後**

```
今日 / カレンダー / イベント / スポット / グルメ / お気に入り / マップ / 制覇
```

---

## 6. 外部 API・環境変数

| 変数名 | 説明 | 取得先 | 追加タイミング |
|-------|------|-------|-------------|
| `HOTPEPPER_API_KEY` | HotPepper グルメ API キー | リクルートWebサービス | Phase 2 前 |
| `GEMINI_API_KEY` | Google Gemini API キー | Google AI Studio | 取得済み |

---

## 7. フェーズ別実装計画

### Phase 0: 構造整理（工数 1〜2h）

**目的：** 設計をスッキリさせてから機能追加に入る

- [ ] `/personal-events` ページ削除
- [ ] `Sidebar.tsx` から「予定」メニューを削除

**GitHub:**
- Issue: `chore: 予定ページをカレンダーに統合する`
- Branch: `chore/merge-personal-events-to-calendar-#xxx`

---

### Phase 1: 観光スポット機能（工数 6〜8h）

**目的：** スポット情報の閲覧機能を実装する

**バックエンド（1-A）**

- [ ] `spots` テーブルのマイグレーション作成・実行
- [ ] `Spot` モデル（バリデーション・スコープ）
- [ ] `Api::V1::SpotsController`（index / show）
- [ ] `Api::V1::Admin::SpotsController`（CRUD）
- [ ] `routes.rb` にエンドポイント追加
- [ ] `db/seeds/spots.rb` に初期データ30件作成・投入

**フロントエンド（1-B）**

- [ ] `types/spot.ts` 型定義
- [ ] `SpotCard.tsx` コンポーネント
- [ ] `AreaSelectMap.tsx` コンポーネント（7エリア SVG マップ）
- [ ] `SpotFilterDrawer.tsx` コンポーネント
- [ ] `/spots` 一覧ページ
- [ ] `/spots/[id]` 詳細ページ
- [ ] `Sidebar.tsx` に「スポット」追加

**GitHub:**
- Issue（バックエンド）: `feature: 観光スポット API を実装する`
- Issue（フロントエンド）: `feature: 観光スポット一覧・詳細ページを実装する`

---

### Phase 2: グルメ機能（工数 4〜5h）

**前提：** HotPepper API キー取得済みであること

**バックエンド（2-A）**

- [ ] `HotpepperService` クラス作成
- [ ] `Api::V1::RestaurantsController`（index）
- [ ] `.env` に `HOTPEPPER_API_KEY` 追加
- [ ] EC2 の `.env` にも追加

**フロントエンド（2-B）**

- [ ] `types/restaurant.ts` 型定義
- [ ] `RestaurantCard.tsx` コンポーネント
- [ ] `/restaurants` 一覧ページ
- [ ] `Sidebar.tsx` に「グルメ」追加

**GitHub:**
- Issue（バックエンド）: `feature: HotPepper API でグルメ情報を取得する`
- Issue（フロントエンド）: `feature: グルメ一覧ページを実装する`

---

### Phase 3: AI チャットボット（工数 4〜5h）

**バックエンド（3-A）**

- [ ] `GeminiService` クラス作成（既存の AI インポートを参考）
- [ ] `Api::V1::AiController`（chat アクション）
- [ ] コンテキスト構築ロジック（近日イベント + スポット一覧を文章化）

**フロントエンド（3-B）**

- [ ] `ChatWidget.tsx` コンポーネント（フローティングボタン + チャットパネル）
- [ ] `layout.tsx` に組み込み（全ページ共通表示）

**GitHub:**
- Issue（バックエンド）: `feature: AI チャット API を実装する（Gemini）`
- Issue（フロントエンド）: `feature: AI チャットウィジェットを実装する`

---

### Phase 4: イベント検索 UX 強化（工数 2〜3h）

- [ ] `QuickDateFilter.tsx` コンポーネント（今日/明日/今週末/今月）
- [ ] `events/page.tsx` に組み込み
- [ ] 季節フィルター（春夏秋冬タブ）を `FilterDrawer.tsx` に追加

**GitHub:**
- Issue: `feature: イベント検索にクイック日程フィルター・季節フィルターを追加する`

---

### Phase 5: ホームページ強化（工数 3〜4h）

- [ ] 今週末のおすすめイベント（3件）プレビューセクション
- [ ] 注目スポット（3件）プレビューセクション
- [ ] Roami の特徴セクション（カレンダー管理 / AI 提案 / 福島制覇）

**GitHub:**
- Issue: `feature: ホームページにコンテンツセクションを追加する`

---

### Phase 6: UI 磨き込み + README（工数 3〜4h）

- [ ] 全体デザイン統一チェック
- [ ] モバイル表示確認
- [ ] `README.md` 作成（セットアップ手順・機能一覧・スクリーンショット）

**GitHub:**
- Issue: `docs: README.md を作成する`

---

## 8. 初期データ計画（spots Seed）

Phase 1 で投入する観光スポット30件の構成：

| エリア | 件数 | 例 |
|-------|-----|-----|
| 県北 | 5件 | 花見山公園、飯坂温泉、土湯温泉 |
| 県中 | 5件 | 三春滝桜、安積国造神社、あぶくま洞 |
| 県南 | 3件 | 南湖公園、白河小峰城 |
| 会津 | 8件 | 鶴ヶ城、大内宿、猪苗代湖、喜多方ラーメン館 |
| 南会津 | 3件 | 塔のへつり、湯野上温泉 |
| いわき | 4件 | スパリゾートハワイアンズ、いわき市石炭・化石館 |
| 相双 | 2件 | 松川浦、請戸の田植踊 |

---

## 9. リスクと対策

| # | リスク | 対策 |
|---|--------|------|
| R-01 | HotPepper API の審査に時間がかかる | Phase 1（スポット）を先に実装し、審査完了後に Phase 2 に入る |
| R-02 | Gemini API のレスポンスが遅い | チャット送信中はローディングスピナーを表示する |
| R-03 | スポットの初期データが少なく見栄えが悪い | Seed で最低 30 件投入、管理者画面から随時追加できる体制を作る |
| R-04 | HotPepper API の無料枠を超える | アクセス数が少ない開発段階では問題なし。本番公開後に監視する |
