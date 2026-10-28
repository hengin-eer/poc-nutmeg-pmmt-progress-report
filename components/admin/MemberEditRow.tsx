import { Form, useForm } from "@void/react";
import { useEffect } from "react";
import { Button, Icon, IconButton } from "../ui";
import { type Props } from "../../pages/admin/index.server";
import { ROLE_LABEL } from "./labels";

type MemberEditRowProps = {
  member: Props["members"][number];
  units: Props["units"];
  isSelf: boolean;
  onDone: () => void;
};

export function MemberEditRow({ member, units, isSelf, onDone }: MemberEditRowProps) {
  const form = useForm("/admin?updateMember", {
    id: member.id,
    name: member.name,
    role: member.role,
    unitId: member.unitId ?? 0,
    slackUserId: member.slackUserId ?? "",
  });
  const formId = `edit-member-${member.id}`;
  useEffect(() => {
    if (form.wasSuccessful) onDone();
  }, [form.wasSuccessful, onDone]);

  return (
    <tr>
      <td>
        <input form={formId} aria-label="名前" aria-invalid={Boolean(form.errors.name)} value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
        {form.errors.name && <div className="error" role="alert">{form.errors.name}</div>}
      </td>
      <td className="meta">{member.email}</td>
      <td>
        <select form={formId} aria-label="役割" aria-invalid={Boolean(form.errors.role)} value={form.data.role} disabled={isSelf} onChange={(e) => form.setData("role", e.target.value as typeof form.data.role)}>
          {Object.entries(ROLE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        {isSelf && <div className="hint">自分の役割は変更できません</div>}
        {form.errors.role && <div className="error" role="alert">{form.errors.role}</div>}
      </td>
      <td>
        <select form={formId} aria-label="ユニット" aria-invalid={Boolean(form.errors.unitId)} value={form.data.unitId} onChange={(e) => form.setData("unitId", Number(e.target.value))}>
          <option value={0}>なし</option>
          {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </select>
        {form.errors.unitId && <div className="error" role="alert">{form.errors.unitId}</div>}
      </td>
      <td>
        <input form={formId} aria-label="Slack ID" aria-invalid={Boolean(form.errors.slackUserId)} value={form.data.slackUserId} placeholder="U0123ABCD" onChange={(e) => form.setData("slackUserId", e.target.value)} />
        {form.errors.slackUserId && <div className="error" role="alert">{form.errors.slackUserId}</div>}
      </td>
      <td>
        <Form id={formId} form={form} className="stack" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
            <Button type="submit" className="small primary" disabled={form.pending}>
              <Icon name="check-line" />保存
            </Button>
            <IconButton type="button" className="icon-button" title="キャンセル" aria-label="編集をキャンセル" disabled={form.pending} onClick={onDone}>
              <Icon name="close-line" />
            </IconButton>
          </div>
          {form.errors.id && <div className="error" role="alert">{form.errors.id}</div>}
        </Form>
      </td>
    </tr>
  );
}
