import { BrandMark, Button, Card, Icon, Row } from "../ui";
import { type Props } from "../../pages/login.server";
import { auth } from "void/client";

export function GoogleLogin({ googleReady }: Pick<Props, "googleReady">) {
  return (
    <Card size="large" className="flex flex-col gap-4">
      <Row className="gap-3">
        <BrandMark>N</BrandMark>
        <h1 className="text-title font-extrabold tracking-[.01em] text-text m-0">NUTMEG PMMT</h1>
      </Row>
      <p className="text-caption text-muted">部門長MTの事前記入・確認事項・記録をまとめるアプリ</p>
      <Button
         variant="primary"
        disabled={!googleReady}
        onClick={() => auth.signIn.social({ provider: "google", callbackURL: "/" })}
      >
        <Icon name="google-fill" />
        NUTMEG の Google アカウントでログイン
      </Button>
      {!googleReady && <p className="text-caption font-normal text-muted">Google ログインはまだ設定されていません（AUTH_GOOGLE_CLIENT_ID）</p>}
      <p className="text-caption font-normal text-muted">
        <code>xx.x.xxxx.nutfes@gmail.com</code> の形式で、管理画面に登録されたアカウントだけが使えます。
      </p>
    </Card>
  );
}
