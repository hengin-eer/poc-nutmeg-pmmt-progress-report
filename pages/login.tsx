import { action } from "@void/react";
import { auth } from "void/client";
import { Button, Card, Icon } from "../components/ui";

import "remixicon/fonts/remixicon.css";
import type { Props } from "./login.server";

export default function LoginPage({ demo, demoMembers, googleReady }: Props) {
  const loginAs = (memberId: number) => action("/login?login", { data: { memberId } }).then(() => (location.href = "/"));

  return (
    <div className="container">
      <div className="login stack">
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

        {demo && (
          <Card className="card card-lg stack">
            <div className="row">
              <h2 style={{ margin: 0 }}>デモ用ログイン</h2>
              <span className="demo-badge">DEMO_MODE</span>
            </div>
            <p className="sub" style={{ margin: 0 }}>
              誰としてログインするか選んでください。局長・副局長を選ぶと管理画面も使えます。
            </p>
            <ul className="list">
              {demoMembers.map((m) => (
                <li key={m.id} className="row">
                  <span>{m.name}</span>
                  <span className="meta">{m.unitName}</span>
                  <span className="spacer" />
                  <Button className="small" onClick={() => loginAs(m.id)}>
                    <Icon name="login-box-line" />
                    入る
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
