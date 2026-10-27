import { boolean, defineEnv, string } from "void/env";

export default defineEnv({
  // true にすると、Google ログインなしで「メンバーを選んでログイン」できる（ローカル開発・デモ用）。
  // 本番では必ず false のままにする。
  DEMO_MODE: boolean().default(false),
  // PMMT 用チャンネルの Incoming Webhook URL。未設定ならログに出すだけ。
  SLACK_WEBHOOK_URL: string().optional(),
  // 通知の本文に載せるアプリの URL
  APP_URL: string().default("http://localhost:5173"),
  AUTH_GOOGLE_CLIENT_ID: string().optional(),
  AUTH_GOOGLE_CLIENT_SECRET: string().optional(),
});
