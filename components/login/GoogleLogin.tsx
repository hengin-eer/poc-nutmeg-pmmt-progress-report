import { auth } from "void/client";
import { type Props } from "../../pages/login.server";
import { Card, Button, Icon } from "../ui";

type GoogleLoginProps = Pick<Props, "googleReady">;

export function GoogleLogin({ googleReady }: GoogleLoginProps) {
  const isGoogleUnavailable = !googleReady;

  function handleGoogleLogin() {
    auth.signIn.social({ provider: "google", callbackURL: "/" });
  }

  return (
    <Card className="card card-lg stack">
      <div className="row" style={{ gap: 12 }}>
        <span className="brand-mark">N</span>
        <h1 style={{ margin: 0 }}>NUTMEG PMMT</h1>
      </div>
      <p className="sub">部門長MTの事前記入・確認事項・記録をまとめるアプリ</p>
      <Button
        className="primary"
        disabled={isGoogleUnavailable}
        onClick={handleGoogleLogin}
      >
        <Icon name="google-fill" />
        NUTMEG の Google アカウントでログイン
      </Button>
      {isGoogleUnavailable && <p className="hint">Google ログインはまだ設定されていません（AUTH_GOOGLE_CLIENT_ID）</p>}
      <p className="hint">
        <code>xx.x.xxxx.nutfes@gmail.com</code> の形式で、管理画面に登録されたアカウントだけが使えます。
      </p>
    </Card>
  );
}
