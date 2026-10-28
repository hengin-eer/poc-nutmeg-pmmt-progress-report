import { action, Form, useForm, useShared } from "@void/react";
import { useState } from "react";
import { Badge, Button, Card, Icon, IconButton, SectionHeader } from "../ui";
import { type Props } from "../../pages/admin/index.server";
import { ROLE_LABEL } from "./labels";
import { MemberEditRow } from "./MemberEditRow";

type MemberSectionProps = Pick<Props, "members" | "units">;

export function MemberSection({ members, units }: MemberSectionProps) {
  const { me } = useShared();
  const [editing, setEditing] = useState<number | null>(null);
  const form = useForm("/admin?addMember", { name: "", email: "", role: "lead" as const, unitId: units[0]?.id ?? 0, slackUserId: "" }, { resetOnSuccess: true });
  const unitName = (id: number | null) => units.find((u) => u.id === id)?.name ?? "—";

  return (
    <Card as="section" className="card card-lg section">
      <SectionHeader className="section-head">
        <Icon name="group-line" className="muted" />
        <h2>メンバー</h2>
        <Badge className="count">{members.length}</Badge>
      </SectionHeader>
      <p className="hint">ここに登録された NUTMEG アカウントだけがログインできます。Slack のユーザー ID を入れると、リマインドでメンションされます。</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>名前</th>
              <th>アドレス</th>
              <th>役割</th>
              <th>ユニット</th>
              <th>Slack</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => editing === m.id ? (
              <MemberEditRow key={m.id} member={m} units={units} isSelf={m.id === me?.id} onDone={() => setEditing(null)} />
            ) : (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td className="meta">{m.email}</td>
                <td>{ROLE_LABEL[m.role]}</td>
                <td>{unitName(m.unitId)}</td>
                <td className="meta">{m.slackUserId ?? "—"}</td>
                <td>
                  <IconButton
                    type="button"
                    className="icon-button"
                    title="編集"
                    aria-label={`${m.name} さんを編集`}
                    onClick={() => setEditing(m.id)}
                  >
                    <Icon name="pencil-line" />
                  </IconButton>
                  <IconButton
                    className="icon-button danger"
                    title="削除"
                    aria-label={`${m.name} さんを削除`}
                    onClick={async () => {
                      if (!confirm(`${m.name} さんを削除しますか？`)) return;
                      const r = await action("/admin?deleteMember", { data: { id: m.id } });
                      if (!r.ok) alert(r.error.message);
                    }}
                  >
                    <Icon name="delete-bin-line" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Form form={form} className="grid add-member" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", alignItems: "end", marginTop: 24, gap: 12 }}>
        <div>
          <label>名前</label>
          <input type="text" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
          {form.errors.name && <div className="error">{form.errors.name}</div>}
        </div>
        <div>
          <label>アドレス</label>
          <input type="email" value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} placeholder="25.t.yamada.nutfes@gmail.com" />
          {form.errors.email && <div className="error">{form.errors.email}</div>}
        </div>
        <div>
          <label>役割</label>
          <select value={form.data.role} onChange={(e) => form.setData("role", e.target.value as typeof form.data.role)}>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>ユニット</label>
          <select value={form.data.unitId} onChange={(e) => form.setData("unitId", Number(e.target.value))}>
            <option value={0}>なし</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Slack ID <span className="hint">任意</span></label>
          <input type="text" value={form.data.slackUserId} onChange={(e) => form.setData("slackUserId", e.target.value)} placeholder="U0123ABCD" />
        </div>
        <Button type="submit" className="primary" disabled={form.pending}>
          <Icon name="user-add-line" />
          追加
        </Button>
      </Form>
    </Card>
  );
}
