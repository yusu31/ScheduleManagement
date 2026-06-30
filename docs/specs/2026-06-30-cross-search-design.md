# 設計書 — 横断検索UI（イベント・スポット・グルメ）

| 項目 | 内容 |
|------|------|
| 作成日 | 2026-06-30 |
| バージョン | 1.0 |
| 作成者 | yusu（Claude Codeとの壁打ちにより作成） |
| ステータス | 設計レビュー待ち |
| 関連 | Phase 4-B サブプロジェクトB（サブプロジェクトA「エリア区分統一」完了後に着手） |

---

## 1. 背景・目的

Roamiには現在、イベント・観光スポット・グルメの検索ページがそれぞれ独立して存在する（`/events`, `/spots`, `/restaurants`）。ユーザーが「郡山」に関する情報をまとめて探したい場合、3つのページを個別に行き来する必要がある。

これを解消するため、キーワード1つでイベント・スポット・グルメを横断的に検索できるUIを追加する。

前提として、Event / Spot / Restaurant のエリア値は2026-06-30マージのPR #169で福島県59市町村に統一済み（[[area-master-data]] 参照）。これにより3エンティティで同じエリア値を使った絞り込みが可能になっている。

### 1-1. 調査で判明した事実

1. **`spots_controller.rb` / `restaurants_controller.rb` には既にキーワード検索（`q`パラメータ）が実装済み**だった。`name`/`description`（Restaurantはさらに`address`）を対象にLIKE検索する。不足しているのは市町村（`municipality`）でのエリア絞り込みのみ。
2. **全ページ共通のレイアウトは `frontend/src/app/layout.tsx` 1枚のみ**で、ログイン前後・ページ種別による分岐はない。`Sidebar`（`frontend/src/components/layout/Sidebar.tsx`）が全ページに常時表示されている。
3. `frontend/src/components/layout/Header.tsx` は現在どこからもimportされていない未使用コンポーネント。
4. イベント・スポット・グルメそれぞれに表示用カードコンポーネント（`EventCard.tsx` / `SpotCard.tsx` / `RestaurantCard.tsx`）が既に存在し、流用できる。
5. `FilterDrawer.tsx`（イベント検索の絞り込みUI）が持つ福島県59市町村のグループ分けリスト（中通り・浜通り・会津）は、横断検索の絞り込みUIにもそのまま使える内容。

---

## 2. 設計方針

### 2-1. UI構成

- 検索ボックスは `Sidebar.tsx` のロゴ直下・ナビゲーション直上に追加し、**全ページ共通で常時表示**する。
- キーワードを入力し Enter キーを押すと、`/search?q=キーワード` に遷移する。
- 既存の `/events` ページ内検索ボックス（イベントのみを対象にした、ページ内クライアント側ナビゲーション用の検索）とは別物として扱う。両者は共存し、互いに置き換えない。

### 2-2. 検索結果ページ（`/search`）

新規ページ `frontend/src/app/search/page.tsx` を作成する。

- URLクエリパラメータ: `q`（キーワード）、`municipalities[]`（エリア、複数選択可）
- ページ上部にエリア絞り込みUI（チップ一覧、`FilterDrawer.tsx`と同じ中通り・浜通り・会津のグループ分け）を表示する
- イベント・観光スポット・グルメの3セクションを縦に並べて表示する。各セクションは該当する既存API（`/api/v1/events`, `/api/v1/spots`, `/api/v1/restaurants`）に `q` と `municipalities[]`（イベントは既存の `areas[]`）を渡して取得し、**先頭5件のみ**を `EventCard` / `SpotCard` / `RestaurantCard` で表示する（5件を超える分はAPIレスポンスから取得済みでもページには出さない。3つのAPIを並列に呼び出すのみで、新しい集約APIは作らない）
- 各セクションに「もっと見る」リンクを設置し、押すと同じ `q` / エリア条件を引き継いだ状態で `/events`, `/spots`, `/restaurants` の各専用ページに遷移する
- 該当0件のセクションは「該当なし」の簡潔な表示にする（非表示にはしない。3エンティティを横断していることが分かるようにするため）

### 2-3. バックエンド変更

`spots_controller.rb` と `restaurants_controller.rb` の `index` アクションに、`events_controller.rb` の `areas[]` と同じ実装パターンで `municipalities[]` パラメータ（`municipality`カラムに対するIN句）を追加する。

```ruby
spots = spots.where(municipality: params[:municipalities]) if params[:municipalities].present?
```

`q`（キーワード検索）は既存実装をそのまま使う。新しい統合検索APIは作らない。

### 2-4. フロントエンド共通化

`FilterDrawer.tsx` にハードコードされている59市町村のグループ分けリスト（`AREA_GROUPS`）を `frontend/src/constants/areas.ts` に切り出し、`FilterDrawer.tsx` と新規 `/search` ページの両方から参照する。同じリストを2箇所に重複させないため。

---

## 3. スコープ外（今回は対応しない）

- 新しい統合検索APIエンドポイント（`/api/v1/search`等）の新設
- カテゴリ・タグでの横断絞り込み（v1はキーワード＋エリアのみ）
- `/search` ページ自体でのページネーション（各セクション5件まで、それ以上は「もっと見る」で専用ページへ）
- 既存の `/events` ページ内検索ボックスの変更・統合

---

## 4. テスト方針

- **バックエンド**: `spots_controller.rb` / `restaurants_controller.rb` の `municipalities[]` フィルタについて、request specまたはmodelスコープレベルのテストを追加する。`bundle exec rubocop` / `bundle exec rspec` を実行し 0 offenses・全テストパスを確認する。
- **フロントエンド**: `npm run lint` で 0 errors / 0 warnings を確認する。ブラウザで「Sidebarの検索ボックスにキーワードを入力 → `/search` 遷移 → 3セクションに正しい件数が表示される → エリアチップで絞り込むと結果が変わる → もっと見るで専用ページに正しい条件で遷移する」までの一連の流れを確認する。デフォルトテーマ・写真テーマ両方でテキストが読めることを確認する。

---

## 5. 実装手順の概要

1. `frontend/src/constants/areas.ts` を新設し、`FilterDrawer.tsx` から `AREA_GROUPS` を移動・参照に変更
2. `spots_controller.rb` / `restaurants_controller.rb` に `municipalities[]` フィルタを追加（テスト含む）
3. `Sidebar.tsx` に検索ボックスを追加
4. `/search` ページを新規実装（エリアチップUI・3セクション表示・もっと見るリンク）
5. RuboCop / RSpec / ESLint 確認
6. ローカルで動作確認（デフォルトテーマ・写真テーマ両方）
7. PR作成 → マージ → 本番デプロイ → 本番動作確認
