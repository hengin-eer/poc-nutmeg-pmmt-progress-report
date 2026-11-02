# NUTMEG PMMT 進捗確認アプリ（プロトタイプ）

PMMT（部門長MT）の事前記入・確認事項の非同期議論・決まったことや TODO の記録を 1 か所にまとめるアプリ。
設計は [設計ドキュメント](docs/design-doc.md)、決定事項は [意思決定ログ](docs/decisions.md) を参照。

- フレームワーク：[Void](https://void.cloud)（Vite + Cloudflare Workers）+ React
- DB：Cloudflare D1（SQLite）+ Drizzle
- 認証：Void の認証（Better Auth）+ Google ログイン

> ⚠️ Void は Cloudflare 専用。本番（オンプレ + Docker）では FW を作り直す前提。
> 引き継げるように、ロジックは `lib/domain.ts`（FW に依存しない）に分けてある（Design Doc §8-2）。

## 動かす

```sh
npm install
cp env.sample .env      # DEMO_MODE=true でメンバーを選んでログインできる
npx void db seed        # ローカル DB を作り直してサンプルデータを入れる
npm run dev             # http://localhost:5173
```

- ログイン画面の「デモ用ログイン」から、誰としてでも入れる。局長・副局長を選ぶと管理画面も使える
- サンプルデータは架空の名前・アドレス。日付は **seed した日を基準に** 作られるので、いつ seed しても「今の回」がある

### npm がインストールスクリプトを止めた時

npm 11 の設定によっては `workerd` / `esbuild` / `better-sqlite3` のインストールスクリプトが止められて、起動できない。その場合は次を実行する。

```sh
npm install-scripts approve workerd esbuild better-sqlite3
npm rebuild workerd esbuild better-sqlite3
```

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm test` | ロジックのテスト（`lib/*.test.ts`） |
| `npm run typecheck` | 型チェック |
| `npx void db seed` | ローカル DB をリセットしてサンプルデータを入れる |
| `npx void db generate` | `db/schema.ts` を変えた後にマイグレーションを作る |
| `npm run deploy` | Cloudflare にデプロイ（初回はブラウザで Cloudflare にログイン） |

## Slack 通知を試す

`SLACK_WEBHOOK_URL` が未設定の時は、通知の内容が開発サーバーのログに `[slack:dry-run]` として出る。
定期実行（毎時）は開発中は自動で動かないので、開発サーバーの起動時に表示される `curl` コマンドで手動実行する。

| タイミング | 通知 |
|---|---|
| 締切の 48 時間前・24 時間前 | 未記入の人へのリマインド（Slack ID を登録しているとメンション） |
| 締切 | 記入状況と未解決の確認事項の数 |
| 確認事項にコメントがついた時 | 書いた人へのメンション |

## 本番（Cloudflare）に出す時

1. Google Cloud で OAuth クライアントを作る（リダイレクト URI: `https://<ドメイン>/api/auth/callback/google`）
2. シークレットを登録する
   ```sh
   npx void secret put AUTH_GOOGLE_CLIENT_ID
   npx void secret put AUTH_GOOGLE_CLIENT_SECRET
   npx void secret put SLACK_WEBHOOK_URL   # 任意
   npx void secret put APP_URL
   ```
3. `DEMO_MODE` は **本番では設定しない**（デフォルトは false）
4. `npm run deploy`
5. 管理画面で、メンバー（NUTMEG アカウント）と報告ユニットを登録する。サンプルデータは本番には入らない

## ファイル構成

```
auth.ts                 Google ログインの設定
env.ts                  環境変数の定義
db/schema.ts            テーブル定義（Drizzle）
db/seed.ts              デモ用のサンプルデータ
lib/domain.ts           FW に依存しないロジック（日時・状態遷移・議事録の解析など）
lib/server.ts           ログイン中のメンバーの判定（resolveMember）など
lib/records-query.ts    記録の検索
lib/items.ts            確認事項のスレッド（読み込み・コメント・リアクション・閉じる）
lib/slack.ts            Slack 通知
middleware/01.member.ts 全リクエストでメンバーを判定し、未ログインならログイン画面へ
crons/notify.ts         毎時：締切前のリマインドと締切の通知
pages/                  画面（*.server.ts がデータの読み込みと操作）
routes/api/records.md.ts 記録の Markdown 書き出し
routes/api/items/[id].ts スレッドの JSON API（ページ遷移なしで開くパネル用）
pages/app.css           Tailwind CSS v4 の入口（テーマ・ユーティリティ）
pages/style.css         既存スタイル（PR A では維持）
components/ui/          Button・Card・Pill・ヘッダー・フォーム枠などの汎用 UI
components/domain.tsx   進捗・忙しさ・確認事項の状態・記録の種別などのドメイン部品
components/layout/     Shell・Sidebar・MobileMenu
components/thread/     スレッドの Provider・パネル・本文・コメント・状態変更・一覧
components/report/     事前記入フォーム・確認事項フォーム・持ち越し一覧
components/dashboard/  Hero・ユニットカード・確認事項一覧・持ち越し一覧
components/unit/       ユニットの概要編集・更新履歴・記録
components/records/    記録の検索フィルター・一覧・行
components/admin/      回・メンバー・ユニットの管理、議事録取り込み
components/login/      Google ログイン・デモ用ログイン
components/markdown.tsx, markdown-editor.tsx  Markdown 表示・入力
```

## スタイルの移行（Issue #4）

PR A では `@tailwindcss/vite` を導入し、既存の HTML 要素・クラス名・`pages/style.css` を維持してコンポーネントを分割しています。汎用 UI はドメインの状態を知らず、`components/domain.tsx` が `Pill` などを組み合わせます。ボタンのバリアントは `tailwind-variants`、クラスの結合は `tailwind-merge` を使います。

`pages/app.css` は `@import "tailwindcss"` のテーマ・ユーティリティ部分だけを読み込みます。[Preflight を外す公式手順](https://tailwindcss.com/docs/preflight#disabling-preflight)に従い、ブラウザー標準の見出し・リスト・フォームなどの表示を変えるリセットを避けています。既存スタイルはその後に読み込みます。また、ログイン画面の既存クラス `container` への幅制限を防ぐため、同名の Tailwind ユーティリティの生成を除外しています。

PR B で CSS 変数を `@theme inline` のトークンに対応付け、各コンポーネントと Markdown 要素を Tailwind クラスへ移植し、`pages/style.css` を削除します。ダークモードの `prefers-color-scheme` と 900px・600px の切り替えは維持します。

## 議事録スキル

[`skills/pmmt-minutes/`](skills/pmmt-minutes/) に、Claude 向けのスキル（`SKILL.md`）と、ChatGPT・Gemini などのチャットに貼るプロンプト（`chat-prompt.md`）がある。
出力を管理画面の「議事録・過去の回の取り込み」に貼り付けると、1 件ずつ確認して記録に登録できる。
