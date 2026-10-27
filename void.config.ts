import { defineConfig } from "void/config";

export default defineConfig({
  worker: {
    compatibility_date: "2026-02-24",
  },
  // 認証の設定は auth.ts（Google の認証情報がある時だけ Google ログインを有効にする）
});
