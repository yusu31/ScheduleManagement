# データベース設計書

## ER 図

```
users                          events
───────────────────            ─────────────────────────────────
id             PK              id              PK
email          string          title           string
encrypted_password string      description     text
created_at     datetime        location        string
updated_at     datetime        area            string
     │                         category        string
     │                         start_at        datetime
     │                         end_at          datetime
     │                         capacity        integer
     │                         event_url       string
     │                         image_url       string
     │                         source          string  ← 'connpass' 固定
     │                         connpass_id     integer
     │                         tags            json    ← ファミリー向けタグ等
     │                         created_at      datetime
     │                         updated_at      datetime
     │                              │                │
     │         schedules            │                │
     │         ──────────────────   │                │
     ├── user_id (FK ──────────────┤)                │
     │         event_id (FK ───────┘)                │
     │         created_at datetime                   │
     │         updated_at datetime                   │
     │                                               │
     │         favorites                             │
     │         ──────────────────                    │
     ├── user_id (FK)                                │
     │         event_id (FK ──────────────────────── ┘)
     │         created_at datetime
     │         updated_at datetime
     │
     │         visit_records
     │         ──────────────────────────────────────
     ├── user_id (FK)
     │         event_id (FK → events.id, NULL可)
     │         municipality   string
     │         companion_type string
     │         photo_url      mediumtext
     │         memo           text
     │         visited_at     datetime
     │         created_at     datetime
     │         updated_at     datetime
     │
     │         region_conquests
     │         ──────────────────────────────────────
     ├── user_id (FK)
     │         region_id      string  ← 市町村ID（例: koriyama）
     │         conquered_at   datetime
     │         created_at     datetime
     │         updated_at     datetime
     │
     │         personal_events
     │         ──────────────────────────────────────
     └── user_id (FK)
               title          string
               memo           text
               event_date     date
               start_time     time
               end_time       time
               location       string
               url            string
               municipality   string
               created_at     datetime
               updated_at     datetime
```

---

## テーブル定義

### users テーブル

Devise Token Auth が自動生成するテーブル。手動でカラムを追加しない。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | bigint | NOT NULL | AUTO_INCREMENT | 主キー |
| provider | varchar(255) | NOT NULL | 'email' | 認証プロバイダ（email 固定） |
| uid | varchar(255) | NOT NULL | '' | ユーザー識別子（メールアドレスと同値） |
| encrypted_password | varchar(255) | NOT NULL | '' | Devise がハッシュ化して保存 |
| reset_password_token | varchar(255) | NULL | - | パスワードリセット用トークン |
| reset_password_sent_at | datetime | NULL | - | リセットメール送信日時 |
| allow_password_change | boolean | NOT NULL | false | パスワード変更許可フラグ |
| remember_created_at | datetime | NULL | - | ログイン維持の記録 |
| confirmation_token | varchar(255) | NULL | - | メール確認トークン |
| confirmed_at | datetime | NULL | - | メール確認日時 |
| confirmation_sent_at | datetime | NULL | - | 確認メール送信日時 |
| unconfirmed_email | varchar(255) | NULL | - | 未確認の新メールアドレス |
| name | varchar(255) | NULL | - | ユーザー名 |
| nickname | varchar(255) | NULL | - | ニックネーム |
| image | varchar(255) | NULL | - | プロフィール画像 URL |
| email | varchar(255) | NULL | - | メールアドレス（ユニーク） |
| tokens | text | NULL | - | 認証トークン（JSON） |
| created_at | datetime | NOT NULL | - | 作成日時 |
| updated_at | datetime | NOT NULL | - | 更新日時 |

### events テーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | bigint | NOT NULL | AUTO_INCREMENT | 主キー |
| title | varchar(255) | NOT NULL | - | イベント名 |
| description | text | NULL | - | 詳細説明 |
| location | varchar(255) | NULL | - | 開催場所（会場名・住所） |
| area | varchar(50) | NOT NULL | - | 地域（下記参照） |
| category | varchar(50) | NOT NULL | - | カテゴリ（下記参照） |
| start_at | datetime | NOT NULL | - | 開始日時 |
| end_at | datetime | NULL | - | 終了日時 |
| capacity | integer | NULL | - | 定員（任意） |
| event_url | varchar(255) | NULL | - | 外部リンク（Connpass URL など） |
| image_url | varchar(255) | NULL | - | イベント画像URL（未設定時はカテゴリ別デフォルト画像を使用） |
| source | varchar(20) | NOT NULL | 'connpass' | 登録元（現在は connpass のみ） |
| connpass_id | integer | NULL | - | Connpass イベント ID（重複防止用） |
| tags | json | NULL | - | ファミリー向けタグ等（例: ["family_friendly", "free", "indoor"]） |
| created_at | datetime | NOT NULL | - | 作成日時 |
| updated_at | datetime | NOT NULL | - | 更新日時 |

#### area カラムの値

| 値 | 表示名 |
|----|--------|
| koriyama | 郡山市 |
| motomiya | 本宮市 |
| iwaki | いわき市 |
| fukushima | 福島市 |
| aizuwakamatsu | 会津若松市 |
| other | その他 |

#### category カラムの値

| 値 | 表示名 |
|----|--------|
| it | IT・テクノロジー |
| music | 音楽 |
| sports | スポーツ |
| food | グルメ・食 |
| art | アート・文化 |
| outdoor | アウトドア |
| family | ファミリー・子ども向け |
| other | その他 |

### schedules テーブル

カレンダーに「予定として追加」したイベントを管理する中間テーブル（F-04）。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | bigint | NOT NULL | AUTO_INCREMENT | 主キー |
| user_id | bigint | NOT NULL | - | ユーザー ID（外部キー） |
| event_id | bigint | NOT NULL | - | イベント ID（外部キー） |
| created_at | datetime | NOT NULL | - | 予定追加日時 |
| updated_at | datetime | NOT NULL | - | 更新日時 |

**ユニーク制約：** `user_id` + `event_id` の組み合わせは重複禁止

### favorites テーブル

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | bigint | NOT NULL | AUTO_INCREMENT | 主キー |
| user_id | bigint | NOT NULL | - | ユーザー ID（外部キー） |
| event_id | bigint | NOT NULL | - | イベント ID（外部キー） |
| created_at | datetime | NOT NULL | - | お気に入り登録日時 |
| updated_at | datetime | NOT NULL | - | 更新日時 |

**ユニーク制約：** `user_id` + `event_id` の組み合わせは重複禁止

### visit_records テーブル

マップ制覇機能（F-15）の訪問記録テーブル。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | bigint | NOT NULL | AUTO_INCREMENT | 主キー |
| user_id | bigint | NOT NULL | - | ユーザー ID（外部キー） |
| event_id | bigint | NULL | - | 参加したイベント ID（外部キー、任意） |
| municipality | varchar(100) | NOT NULL | - | 訪問した市町村名（例: 郡山市） |
| companion_type | varchar(20) | NOT NULL | - | 同行者区分（下記参照） |
| photo_url | mediumtext | NULL | - | アップロードした写真（Base64 または URL） |
| memo | text | NULL | - | 訪問メモ |
| visited_at | datetime | NOT NULL | - | 訪問日時 |
| created_at | datetime | NOT NULL | - | 作成日時 |
| updated_at | datetime | NOT NULL | - | 更新日時 |

#### companion_type カラムの値

| 値 | 表示名 |
|----|--------|
| family | 家族 |
| partner | 恋人 |
| solo | 一人 |
| friends | 友人 |

### region_conquests テーブル

コレクション機能（マップ制覇の市町村クリア記録）。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | bigint | NOT NULL | AUTO_INCREMENT | 主キー |
| user_id | bigint | NOT NULL | - | ユーザー ID（外部キー） |
| region_id | varchar(255) | NOT NULL | - | 市町村 ID（例: koriyama） |
| conquered_at | datetime | NOT NULL | - | 制覇日時 |
| created_at | datetime | NOT NULL | - | 作成日時 |
| updated_at | datetime | NOT NULL | - | 更新日時 |

**ユニーク制約：** `user_id` + `region_id` の組み合わせは重複禁止

### personal_events テーブル

ユーザーが独自に登録する「マイ予定」テーブル。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | bigint | NOT NULL | AUTO_INCREMENT | 主キー |
| user_id | bigint | NOT NULL | - | ユーザー ID（外部キー） |
| title | varchar(255) | NOT NULL | - | 予定タイトル |
| memo | text | NULL | - | メモ |
| event_date | date | NOT NULL | - | 開催日 |
| start_time | time | NULL | - | 開始時刻 |
| end_time | time | NULL | - | 終了時刻 |
| location | varchar(255) | NULL | - | 開催場所 |
| url | varchar(255) | NULL | - | 関連 URL |
| municipality | varchar(255) | NULL | - | 市町村 |
| created_at | datetime | NOT NULL | - | 作成日時 |
| updated_at | datetime | NOT NULL | - | 更新日時 |

---

## インデックス設計

| テーブル | カラム | 種別 | 理由 |
|---------|-------|------|------|
| users | email | UNIQUE | ログイン時の検索を高速化 |
| events | start_at | INDEX | 日付絞り込みを高速化 |
| events | area | INDEX | 地域絞り込みを高速化 |
| events | category | INDEX | カテゴリ絞り込みを高速化 |
| events | connpass_id | UNIQUE | 重複取込み防止 |
| schedules | (user_id, event_id) | UNIQUE | 重複予定登録防止 |
| favorites | (user_id, event_id) | UNIQUE | 重複お気に入り防止 |
| visit_records | (user_id, municipality) | INDEX | マップ制覇画面の表示を高速化 |
| region_conquests | (user_id, region_id) | UNIQUE | 市町村の重複制覇防止 |

---

## マイグレーション実行順序

```
1. create_users               ← Devise が自動生成
2. create_events              ← events テーブル作成
3. create_schedules           ← schedules テーブル作成（users・events より後）
4. create_favorites           ← favorites テーブル作成（users・events より後）
5. create_visit_records       ← visit_records テーブル作成（users・events より後）
6. create_personal_events     ← personal_events テーブル作成（users より後）
7. add_time_to_personal_events            ← start_time / end_time 追加
8. add_location_and_url_to_personal_events ← location / url 追加
9. add_tags_to_events         ← events.tags（json）追加
10. update_visit_records      ← event_id を NULL 可・memo 追加
11. change_photo_url_to_mediumtext_in_visit_records ← photo_url を MEDIUMTEXT に変更
12. create_region_conquests   ← region_conquests テーブル作成（users より後）
13. add_municipality_to_personal_events   ← personal_events.municipality 追加
```
