# AIレビュー結果（Claude / Claude Code）

**対象プロジェクト:** Roami（Next.js + TypeScript / Ruby on Rails）  
**レビュー日:** 2026-07-01

---

## 良い点

### バックエンド

- **エラーハンドリングが一元化されている**: `ApplicationController` に `rescue_from ActiveRecord::RecordNotFound` と `rescue_from ActiveRecord::RecordInvalid` を設定しており、コントローラーごとに rescue を書かずに済む設計になっている
- **N+1 対策が実装されている**: `FavoritesController` `SchedulesController` `ConquerController` で `includes(:event)` を使い、関連イベントを一括取得している
- **LIKE 検索の SQL インジェクション対策**: `EventsController` の `sanitize_like` メソッドで `%` `_` `\` をエスケープしており、キーワード検索で意図したワイルドカード展開が起きない
- **バリデーションが定数で管理されている**: `Event` モデルで `AREAS` `CATEGORIES` `TAGS` `STATUSES` を定数として定義し、`inclusion: { in: }` で検証している。バリデーションと UI の選択肢が一箇所で管理できている
- **管理者認証が BaseController に集約されている**: `Admin::BaseController#require_admin!` を `before_action` にすることで、管理者コントローラー全体に認証が確実に適用されている
- **Connpass ID の重複防止**: `validates :connpass_id, uniqueness: true, allow_nil: true` により、API から同一イベントを二重取得しても DB に重複登録されない
- **ページネーションのパラメータ検証**: `per_page` に `PER_PAGE_MAX = 200` の上限を設け、大量取得によるサーバー負荷を防いでいる

### フロントエンド

- **Context API で状態管理を分離**: `AuthContext` `ThemeContext` `FavoritesContext` に責任が分かれており、コンポーネントが肥大化していない
- **TypeScript の型定義ファイルが整備されている**: `types/event.ts` `types/spot.ts` などを独立させており、複数コンポーネントから型を共有できる構成になっている

---

## 改善できる点

### 1. CORS 設定がハードコードされている

`backend/config/initializers/cors.rb:4`

```ruby
origins "http://localhost:3000"  # ← 本番 URL が含まれていない
```

本番環境では別途設定が必要になる。`ENV["CORS_ALLOWED_ORIGINS"]` のような環境変数で切り替えられると、コードを変えずに環境ごとの設定が可能になる。

### 2. 管理者イベント一覧で N+1 が発生する可能性がある

`backend/app/controllers/api/v1/admin/events_controller.rb:12`

```ruby
events = Event.all.order(created_at: :desc)
render json: events.map { |e| event_json(e) }
```

`event_json` の中でアソシエーション（`favorites` `schedules` など）を参照している場合、イベント件数分だけ SQL が発行される。`Event.includes(:favorites, :schedules)` を追加すると解消できる。

### 3. イベント一覧 API がモデルをそのまま JSON 出力している

`backend/app/controllers/api/v1/events_controller.rb:47`

```ruby
render json: { events: events, meta: { ... } }
```

`events` を `ActiveRecord::Relation` のまま渡しているため、`source` `updated_at` などの内部フィールドもすべてクライアントに返っている。`jbuilder` や `ActiveModelSerializer` で返すフィールドを明示すると、余分な情報の露出を防げる。

### 4. `sanitize_like` がコントローラーのみに閉じている

`EventsController` の `private` に定義されているため、他のコントローラーでも LIKE 検索が必要になったとき、メソッドをコピーすることになる。`ApplicationController` に移すか `Concern` として共通化すると再利用しやすい。

---

## 総評

学習段階のプロジェクトとして、**Rails の基本的なベストプラクティスが正しく実装できている**。特に「エラーハンドリングの一元化」「N+1 の意識的な回避」「管理者認証の BaseController 集約」は、ただ動くだけでなく設計を考えた実装になっている。

改善点のうち「本番運用で問題になるもの」は CORS のハードコードのみ。それ以外はパフォーマンス改善や情報隠蔽に関するもので、現状の機能動作には影響しない。
