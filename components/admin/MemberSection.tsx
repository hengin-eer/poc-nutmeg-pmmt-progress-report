import { Form, action, useForm, useShared } from "@void/react";
import { useState, type ChangeEvent } from "react";
import { type Props } from "../../pages/admin/index.server";
import { Badge, Button, Card, Icon, IconButton, Input, Label, SectionHeader, Select, Table } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";
import { ROLE_LABEL } from "./labels";
import { MemberEditRow } from "./MemberEditRow";

type MemberSectionProps = Pick<Props, "members" | "units">;

type Member = Props["members"][number];

export function MemberSection({ members, units }: MemberSectionProps) {
  const { me } = useShared();
  const [editing, setEditing] = useState<number | null>(null);
  const form = useForm("/admin?addMember", { name: "", email: "", role: "lead" as const, unitId: units[0]?.id ?? 0, slackUserId: "" }, { resetOnSuccess: true });
  const hasNameError = Boolean(form.errors.name);
  const hasEmailError = Boolean(form.errors.email);

  function isEditingMember(m: Member) {
    return editing === m.id;
  }

  function isCurrentMember(m: Member) {
    return m.id === me?.id;
  }

  function getMemberSlackLabel(m: Member) {
    return m.slackUserId ?? "—";
  }

  function unitName(id: number | null) {
    return units.find((u) => u.id === id)?.name ?? "—";
  }

  function handleFinishEditing() {
    setEditing(null);
  }

  function handleEditMember(m: Member) {
    setEditing(m.id);
  }

  async function handleDeleteMember(m: Member) {
    if (!confirm(`${m.name} さんを削除しますか？`)) return;
    const r = await action("/admin?deleteMember", { data: { id: m.id } });
    if (!r.ok) alert(r.error.message);
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("name", e.target.value);
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("email", e.target.value);
  }

  function handleRoleChange(e: ChangeEvent<HTMLSelectElement>) {
    form.setData("role", e.target.value as typeof form.data.role);
  }

  function handleUnitIdChange(e: ChangeEvent<HTMLSelectElement>) {
    form.setData("unitId", Number(e.target.value));
  }

  function handleSlackUserIdChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("slackUserId", e.target.value);
  }

  return (
    <Card as="section" size="large" className="mt-10">
      <SectionHeader>
        <Icon name="group-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>メンバー</h2>
        <Badge>{members.length}</Badge>
      </SectionHeader>
      <p className={textStyles({ className: "mb-3", role: "hint" })}>ここに登録された NUTMEG アカウントだけがログインできます。Slack のユーザー ID を入れると、リマインドでメンションされます。</p>
      <div className="overflow-x-auto">
        <Table className="min-w-[760px] whitespace-nowrap [&_td:first-child]:min-w-32 [&_td:nth-child(3)]:min-w-24 [&_td:nth-child(4)]:min-w-32">
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
            {members.map((m) => isEditingMember(m) ? (
              <MemberEditRow key={m.id} member={m} units={units} isSelf={isCurrentMember(m)} onDone={handleFinishEditing} />
            ) : (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td className={textStyles({ role: "meta" })}>{m.email}</td>
                <td>{ROLE_LABEL[m.role]}</td>
                <td>{unitName(m.unitId)}</td>
                <td className={textStyles({ role: "meta" })}>{getMemberSlackLabel(m)}</td>
                <td>
                  <IconButton
                    type="button"

                    title="編集"
                    aria-label={`${m.name} さんを編集`}
                    onClick={() => handleEditMember(m)}
                  >
                    <Icon name="pencil-line" />
                  </IconButton>
                  <IconButton
                     danger
                    title="削除"
                    aria-label={`${m.name} さんを削除`}
                    onClick={() => handleDeleteMember(m)}
                  >
                    <Icon name="delete-bin-line" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Form form={form} className="grid grid-cols-[repeat(auto-fit,_minmax(170px,_1fr))] items-end mt-6 gap-3">
        <div>
          <Label>名前</Label>
          <Input type="text" value={form.data.name} onChange={handleNameChange} />
          {hasNameError && <div className={textStyles({ role: "error" })}>{form.errors.name}</div>}
        </div>
        <div>
          <Label>アドレス</Label>
          <Input type="email" value={form.data.email} onChange={handleEmailChange} placeholder="25.t.yamada.nutfes@gmail.com" />
          {hasEmailError && <div className={textStyles({ role: "error" })}>{form.errors.email}</div>}
        </div>
        <div>
          <Label>役割</Label>
          <Select value={form.data.role} onChange={handleRoleChange}>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>ユニット</Label>
          <Select value={form.data.unitId} onChange={handleUnitIdChange}>
            <option value={0}>なし</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Slack ID <span className={textStyles({ role: "hint" })}>任意</span></Label>
          <Input type="text" value={form.data.slackUserId} onChange={handleSlackUserIdChange} placeholder="U0123ABCD" />
        </div>
        <Button type="submit" variant="primary" disabled={form.pending}>
          <Icon name="user-add-line" />
          追加
        </Button>
      </Form>
    </Card>
  );
}
