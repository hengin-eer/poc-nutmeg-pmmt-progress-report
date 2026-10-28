import { textStyles } from "../ui/styles";
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
      <p className={textStyles({ className: "mb-3", role: "meta" })}>部門長MTの事前記入・確認事項・記録をまとめるアプリ</p>
      <Button
         variant="primary"
        disabled={!googleReady}
        onClick={() => auth.signIn.social({ provider: "google", callbackURL: "/" })}
      >
        <Icon name="google-fill" />
        NUTMEG の Google アカウントでログイン
      </Button>
      {!googleReady && <p className={textStyles({ className: "mb-3", role: "hint" })}>Google ログインはまだ設定されていません（AUTH_GOOGLE_CLIENT_ID）</p>}
      <p className={textStyles({ className: "mb-3", role: "hint" })}>
        <code className="rounded-md bg-surface-2 px-1 py-px text-[.9em]">xx.x.xxxx.nutfes@gmail.com</code> の形式で、管理画面に登録されたアカウントだけが使えます。
      </p>
    </Card>
  );
}
