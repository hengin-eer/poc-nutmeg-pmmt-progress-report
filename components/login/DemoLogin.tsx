import { action } from "@void/react";
import { Card, Button, Icon } from "../ui";
import { type Props } from "../../pages/login.server";

type DemoLoginProps = Pick<Props, "demoMembers">;

export function DemoLogin({ demoMembers }: DemoLoginProps) {
  const loginAs = (memberId: number) => action("/login?login", { data: { memberId } }).then(() => (location.href = "/"));

  function handleDemoLogin(m: (typeof demoMembers)[number]) { return loginAs(m.id); }

  return (
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
            <Button className="small" onClick={() => handleDemoLogin(m)}>
              <Icon name="login-box-line" />
              入る
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
