import { Form, Link, useForm } from "@void/react";
import { Badge, Button, Card, Icon, SectionHeader } from "../ui";
import { UNIT_KIND_LABEL, type UnitKind } from "../domain";
import { type Props } from "../../pages/admin/index.server";

export function UnitSection({ units }: Pick<Props, "units">) {
  const form = useForm("/admin?addUnit", { name: "", kind: "project" as UnitKind }, { resetOnSuccess: true });
  return (
    <Card as="section" className="card card-lg section">
      <SectionHeader className="section-head">
        <Icon name="flag-line" className="muted" />
        <h2>報告ユニット</h2>
        <Badge className="count">{units.length}</Badge>
      </SectionHeader>
      <p className="hint">進捗を報告する単位です。目的・概要は各ユニットのページで編集できます。</p>
      <ul className="list">
        {units.map((u) => (
          <li key={u.id} className="row">
            <Link href={`/units/${u.id}`}>{u.name}</Link>
            <span className="meta">{UNIT_KIND_LABEL[u.kind]}</span>
          </li>
        ))}
      </ul>
      <Form form={form} className="row" style={{ marginTop: 20 }}>
        <input type="text" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} placeholder="ユニット名" style={{ flex: 1, minWidth: 160 }} />
        <select value={form.data.kind} onChange={(e) => form.setData("kind", e.target.value as UnitKind)} style={{ width: "auto" }}>
          {(Object.keys(UNIT_KIND_LABEL) as UnitKind[]).map((k) => (
            <option key={k} value={k}>
              {UNIT_KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={form.pending}>
          追加
        </Button>
      </Form>
      {form.errors.name && <p className="error">{form.errors.name}</p>}
    </Card>
  );
}
