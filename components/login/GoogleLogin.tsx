import { Card, Button, Icon } from "../ui";
import { type Props } from "../../pages/login.server";
import { auth } from "void/client";

type GoogleLoginProps = Pick<Props, "googleReady">;

export function GoogleLogin({ googleReady }: GoogleLoginProps) {
  return (
    <Card className="card card-lg stack">
      <div className="row" style={{ gap: 12 }}>
        <span className="brand-mark">N</span>
        <h1 style={{ margin: 0 }}>NUTMEG PMMT</h1>
      </div>
      <p className="sub">部門長MTの事前記入・確認事項・記録をまとめるアプリ</p>
      <Button
        className="primary"
        disabled={!googleReady}
        onClick={() => auth.signIn.social({ provider: "google", callbackURL: "/" })}
      >
        <Icon name="google-fill" />
        NUTMEG の Google アカウントでログイン
      </Button>
      {!googleReady && <p className="hint">Google ログインはまだ設定されていません（AUTH_GOOGLE_CLIENT_ID）</p>}
      <p className="hint">
        <code>xx.x.xxxx.nutfes@gmail.com</code> の形式で、管理画面に登録されたアカウントだけが使えます。
      </p>
    </Card>
  );
}
