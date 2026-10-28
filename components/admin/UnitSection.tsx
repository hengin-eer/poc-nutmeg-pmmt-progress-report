import { Form, useForm } from "@void/react";
import { type ChangeEvent } from "react";
import { type Props } from "../../pages/admin/index.server";
import { UNIT_KIND_LABEL, type UnitKind } from "../domain";
import { Badge, Button, Card, Icon, Input, Link, List, SectionHeader, Select } from "../ui";
import { flowStyles } from "../ui/Flow";
import { headingStyles, textStyles } from "../ui/styles";

type UnitSectionProps = Pick<Props, "units">;

export function UnitSection({ units }: UnitSectionProps) {
  const form = useForm("/admin?addUnit", { name: "", kind: "project" as UnitKind }, { resetOnSuccess: true });
  const hasNameError = Boolean(form.errors.name);

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("name", e.target.value);
  }

  function handleKindChange(e: ChangeEvent<HTMLSelectElement>) {
    form.setData("kind", e.target.value as UnitKind);
  }

  return (
    <Card as="section" size="large" className="mt-10">
      <SectionHeader>
        <Icon name="flag-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>報告ユニット</h2>
        <Badge>{units.length}</Badge>
      </SectionHeader>
      <p className={textStyles({ className: "mb-3", role: "hint" })}>進捗を報告する単位です。目的・概要は各ユニットのページで編集できます。</p>
      <List>
        {units.map((u) => (
          <li key={u.id} className={flowStyles({ direction: "row", gap: 2 })}>
            <Link href={`/units/${u.id}`}>{u.name}</Link>
            <span className={textStyles({ role: "meta" })}>{UNIT_KIND_LABEL[u.kind]}</span>
          </li>
        ))}
      </List>
      <Form form={form} className="flex flex-wrap items-center gap-2 mt-4">
        <Input type="text" value={form.data.name} onChange={handleNameChange} placeholder="ユニット名" className="flex-1 min-w-[160px]" />
        <Select value={form.data.kind} onChange={handleKindChange} className="w-auto">
          {(Object.keys(UNIT_KIND_LABEL) as UnitKind[]).map((k) => (
            <option key={k} value={k}>
              {UNIT_KIND_LABEL[k]}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={form.pending}>
          追加
        </Button>
      </Form>
      {hasNameError && <p className={textStyles({ className: "mb-3", role: "error" })}>{form.errors.name}</p>}
    </Card>
  );
}
