# 設計書

## システム構成

```
ブラウザ
  │
  ▼
Next.js（フロントエンド） :3000
  │  JSON（API通信）
  ▼
Ruby on Rails（バックエンド API） :8080
  │  SQL
  ▼
MySQL（データベース） :3306（Docker）
```

---

## ER 図（テーブル設計）

```
users                          events
───────────────────            ─────────────────────────
id             PK              id             PK
email          string          title          string
password_digest string         description    text
created_at     datetime        location       string
updated_at     datetime        area           string      ← 地域（例: 郡山市）
                               category       string      ← カテゴリ（例: IT勉強会）
                               start_at       datetime    ← 開始日時
                               end_at         datetime    ← 終了日時（任意）
                               capacity       integer     ← 定員（任意）
                               event_url      string      ← 外部URL（Connpass等）
                               source         string      ← 'manual' or 'connpass'
                               connpass_id    integer     ← Connpassのイベントid（重複防止）
                               user_id        integer  FK → users.id
                               created_at     datetime
                               updated_at     datetime


favorites
───────────────────
id             PK
user_id        integer  FK → users.id
event_id       integer  FK → events.id
created_at     datetime
updated_at     datetime

※ user_id + event_id の組み合わせはユニーク制約をつける
```

### テーブル詳細

#### users テーブル

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| id | bigint | ◎ | 主キー（自動採番） |
| email | string | ◎ | メールアドレス（ユニーク） |
| encrypted_password | string | ◎ | Devise がハッシュ化して保存 |
| created_at | datetime | ◎ | 作成日時 |
| updated_at | datetime | ◎ | 更新日時 |

#### events テーブル

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| id | bigint | ◎ | 主キー |
| title | string | ◎ | イベント名 |
| description | text | - | 詳細説明 |
| location | string | - | 開催場所（会場名・住所） |
| area | string | ◎ | 地域（郡山市 / 本宮市 / いわき市 / その他） |
| category | string | ◎ | カテゴリ（IT / 音楽 / スポーツ / 食 / その他） |
| start_at | datetime | ◎ | 開始日時 |
| end_at | datetime | - | 終了日時 |
| capacity | integer | - | 定員 |
| event_url | string | - | 外部リンク（Connpass URL など） |
| source | string | ◎ | 登録元（manual / connpass） |
| connpass_id | integer | - | Connpass イベント ID（重複取込み防止） |
| user_id | bigint | - | 登録ユーザー（NULL = Connpass 自動取得） |
| created_at | datetime | ◎ | 作成日時 |
| updated_at | datetime | ◎ | 更新日時 |

#### favorites テーブル

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| id | bigint | ◎ | 主キー |
| user_id | bigint | ◎ | ユーザー ID（外部キー） |
| event_id | bigint | ◎ | イベント ID（外部キー） |
| created_at | datetime | ◎ | お気に入り登録日時 |

---

## API エンドポイント一覧

### 認証（Devise Token Auth）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/v1/auth` | サインアップ |
| POST | `/api/v1/auth/sign_in` | ログイン |
| DELETE | `/api/v1/auth/sign_out` | ログアウト |

### イベント

| メソッド | パス | 説明 | 認証必要 |
|---------|------|------|---------|
| GET | `/api/v1/events` | イベント一覧取得 | 不要 |
| GET | `/api/v1/events/:id` | イベント詳細取得 | 不要 |
| POST | `/api/v1/events` | イベント登録 | 必要 |
| PATCH | `/api/v1/events/:id` | イベント更新 | 必要（自分のイベントのみ） |
| DELETE | `/api/v1/events/:id` | イベント削除 | 必要（自分のイベントのみ） |

#### GET /api/v1/events のクエリパラメータ（絞り込み）

| パラメータ | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| area | string | 地域で絞り込み | `?area=郡山市` |
| category | string | カテゴリで絞り込み | `?category=IT` |
| start_date | date | この日以降のイベント | `?start_date=2024-01-01` |
| end_date | date | この日以前のイベント | `?end_date=2024-12-31` |

### お気に入り

| メソッド | パス | 説明 | 認証必要 |
|---------|------|------|---------|
| GET | `/api/v1/favorites` | お気に入り一覧取得 | 必要 |
| POST | `/api/v1/favorites` | お気に入り追加 | 必要 |
| DELETE | `/api/v1/favorites/:event_id` | お気に入り削除 | 必要 |

### Connpass 連携

| メソッド | パス | 説明 | 認証必要 |
|---------|------|------|---------|
| POST | `/api/v1/connpass/fetch` | Connpass から取得・保存 | 管理者のみ（MVP では省略） |

---

## 画面一覧（フロントエンド）

| パス | 画面名 | 説明 |
|------|--------|------|
| `/` | トップページ | イベント一覧（カード形式） |
| `/calendar` | カレンダー画面 | FullCalendar でイベントを表示 |
| `/events/new` | イベント登録画面 | フォームでイベントを登録 |
| `/events/[id]` | イベント詳細画面 | イベントの詳細情報を表示 |
| `/events/[id]/edit` | イベント編集画面 | イベント情報を編集 |
| `/auth/signup` | サインアップ画面 | 新規ユーザー登録 |
| `/auth/login` | ログイン画面 | メール・パスワードでログイン |
| `/favorites` | お気に入り一覧 | お気に入りのイベント一覧 |

---

## データの流れ（Connpass 連携）

```
管理者が /api/v1/connpass/fetch を POST
  │
  ▼
Rails が Connpass API を呼び出す
  GET https://connpass.com/api/v1/event/?keyword=福島&count=100
  │
  ▼
レスポンスの events を events テーブルに保存
（connpass_id が重複する場合はスキップ）
  │
  ▼
フロントエンドの一覧に自動で表示される
```
