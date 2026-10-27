import { defineAuth } from "void/auth";

// NUTMEG の Google アカウントでログイン（Design Doc §9）。
// 認証情報が未設定の時（ローカル開発・デモ）は Google ログインを無効にして起動できるようにする。
export default defineAuth(({ defaults, env }) => {
  const clientId = env.AUTH_GOOGLE_CLIENT_ID as string | undefined;
  const clientSecret = env.AUTH_GOOGLE_CLIENT_SECRET as string | undefined;
  return {
    ...defaults,
    emailAndPassword: { enabled: false },
    socialProviders: clientId && clientSecret ? { google: { clientId, clientSecret } } : {},
  };
});
