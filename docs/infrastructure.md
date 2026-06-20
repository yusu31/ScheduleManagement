# インフラ設計書

## AWS 構成図

```
インターネット
    │
    ▼ HTTP :80
  nginx（EC2上）
    │
    ▼ :3000
  Next.js フロントエンド（EC2上）
    │ API リクエスト（/api/*, /auth/*）
    ▼ :8080
  Ruby on Rails API（EC2上）
    │ SQL
    ▼ :3306
  Amazon RDS（MySQL 8.0）
```

---

## AWS リソース一覧

| リソース | 詳細 |
|---------|------|
| リージョン | ap-northeast-1（東京） |
| EC2 インスタンス | t2.micro（無料枠対象） |
| OS | Amazon Linux 2023 |
| Elastic IP | 13.114.226.79（固定パブリック IP） |
| RDS | MySQL 8.0（db.t3.micro） |
| RDS エンドポイント | event-finder-db.cxgg8smomhte.ap-northeast-1.rds.amazonaws.com |
| VPC | カスタム VPC（Terraform 管理） |
| セキュリティグループ（EC2） | HTTP:80（0.0.0.0/0）、SSH:22（許可 IP のみ） |

> **注意：** SSH 許可 IP は固定（セキュリティグループ）。接続元 IP が変わった場合は AWS コンソールで更新すること。

---

## EC2 サービス構成

### nginx（リバースプロキシ）

- 受け付けポート：80
- 全リクエストを `http://localhost:3000`（Next.js）に転送する
- 設定ファイル：`/etc/nginx/conf.d/default.conf`

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### nextjs.service（フロントエンド）

- `npm run start` で Next.js を起動（ポート 3000）
- `/api/*` と `/auth/*` のリクエストは `http://localhost:8080` へ `next.config.mjs` の rewrites でプロキシ
- systemd で自動起動・クラッシュ時自動再起動

### rails-api.service（バックエンド）

- Puma で Rails API を起動（ポート 8080）
- 環境変数は `/var/www/event-finder/backend/.env` から読み込む
- systemd で自動起動・クラッシュ時自動再起動

---

## サービス操作コマンド

```bash
# 状態確認
sudo systemctl status rails-api
sudo systemctl status nextjs
sudo systemctl status nginx

# 再起動
sudo systemctl restart rails-api
sudo systemctl restart nextjs
sudo systemctl restart nginx

# ログ確認
sudo journalctl -u rails-api -n 50
sudo journalctl -u nextjs -n 50
```

---

## 環境変数

Rails の環境変数は `/var/www/event-finder/backend/.env` に設定する（Git 管理外）。

| 変数名 | 説明 |
|--------|------|
| `DB_HOST` | RDS エンドポイント |
| `MYSQL_USER` | RDS ユーザー名 |
| `MYSQL_PASSWORD` | RDS パスワード |
| `RAILS_MASTER_KEY` | credentials の復号キー |
| `SECRET_KEY_BASE` | セッション暗号化キー |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API キー |

---

## デプロイ手順

### 前提

- SSH キー：`terraform/app-key`
- 接続コマンド：`ssh -i terraform/app-key ec2-user@13.114.226.79`
- アプリディレクトリ：`/var/www/event-finder`

### 手順

```bash
# 1. EC2 に SSH 接続
ssh -i terraform/app-key ec2-user@13.114.226.79

# 2. 最新コードを取得
cd /var/www/event-finder
git pull origin main

# 3. バックエンドの依存関係を更新
cd backend
bundle install --without development test

# 4. DB マイグレーションを実行
RAILS_ENV=production bundle exec rails db:migrate

# 5. Rails を再起動
sudo systemctl restart rails-api

# 6. フロントエンドの依存関係を更新
cd ../frontend
npm install

# 7. 本番ビルド（メモリ不足防止のため nohup で実行）
nohup npm run build > /tmp/nextbuild.log 2>&1 &

# 8. ビルド完了を確認
tail -f /tmp/nextbuild.log
# "✓ Generating static pages" が表示されたら完了

# 9. Next.js を再起動
sudo systemctl restart nextjs
```

### 注意事項

- t2.micro はメモリ 1 GB のため、`npm run build` が OOM でハングする場合がある
- スワップが未設定の場合は事前に追加すること：

```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Terraform 管理リソース

インフラは `terraform/` ディレクトリで管理している。

| ファイル | 内容 |
|---------|------|
| `main.tf` | プロバイダ設定 |
| `vpc.tf` | VPC・サブネット・IGW |
| `ec2.tf` | EC2 インスタンス・Elastic IP |
| `rds.tf` | RDS インスタンス |
| `security_groups.tf` | セキュリティグループ |
| `variables.tf` | 変数定義 |
| `outputs.tf` | 出力値（IP・接続コマンド等） |

---

## 改訂履歴

| バージョン | 日付 | 変更者 | 変更内容 |
|-----------|------|--------|---------|
| 1.0 | 2026-06-21 | yusu | 初版作成（フェーズ 16 デプロイ完了時） |
