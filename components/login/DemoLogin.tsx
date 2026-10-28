import { action } from "@void/react";
import { type Props } from "../../pages/login.server";
import { Button, Card, Icon, List, Row } from "../ui";
import { flowStyles } from "../ui/Flow";
import { textStyles } from "../ui/styles";

type DemoLoginProps = Pick<Props, "demoMembers">;

type DemoMember = Props["demoMembers"][number];

export function DemoLogin({ demoMembers }: DemoLoginProps) {
  function loginAs(memberId: number) {
    return action("/login?login", { data: { memberId } }).then(() => (location.href = "/"));
  }

  function handleDemoLogin(m: DemoMember) {
    loginAs(m.id);
  }

  return (
    <Card size="large" className="flex flex-col gap-4">
      <Row>
        <h2 className="text-heading font-bold text-text m-0">デモ用ログイン</h2>
        <span className="ml-2 rounded-full bg-yellow-soft px-2 py-px text-caption font-bold text-yellow">DEMO_MODE</span>
      </Row>
      <p className="text-caption text-muted m-0">
        誰としてログインするか選んでください。局長・副局長を選ぶと管理画面も使えます。
      </p>
      <List>
        {demoMembers.map((m) => (
          <li key={m.id} className={flowStyles({ direction: "row", gap: 2 })}>
            <span>{m.name}</span>
            <span className={textStyles({ role: "meta" })}>{m.unitName}</span>
            <span className="flex-1" />
            <Button size="small" onClick={() => handleDemoLogin(m)}>
              <Icon name="login-box-line" />
              入る
            </Button>
          </li>
        ))}
      </List>
    </Card>
  );
}
