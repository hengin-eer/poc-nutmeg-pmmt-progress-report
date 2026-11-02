import { defineConfig } from "void/config";

const siteTitle = "PMMT 進捗確認";
const siteDescription = "NUTMEG PMMT の進捗確認アプリ（プロトタイプ）。各局の進捗・確認したいこと・話したいことを会議前に集めて共有します。";
const siteUrl = "https://nutmeg-pmmt-progress.hiro-to.moda";

export default defineConfig({
  head: {
    title: siteTitle,
    htmlAttrs: { lang: "ja" },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: siteDescription },
      { property: "og:title", content: siteTitle },
      { property: "og:description", content: siteDescription },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "NUTMEG PMMT" },
      { property: "og:locale", content: "ja_JP" },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: `${siteUrl}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#2f6fed" },
    ],
    link: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  },
  cloudflare: {
    name: "nutmeg-pmmt-progress",
    workers_dev: true,
  },
  worker: {
    compatibility_date: "2026-02-24",
  },
  // 認証の設定は auth.ts（Google の認証情報がある時だけ Google ログインを有効にする）
});
