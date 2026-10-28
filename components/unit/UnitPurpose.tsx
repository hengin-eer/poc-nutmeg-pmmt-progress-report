import { Form, useForm } from "@void/react";
import { useEffect, useState } from "react";
import { Button, Card, Field, Icon, IconButton, Input, Label, Row, SectionHeader, Textarea } from "../ui";
import { type Props } from "../../pages/units/[id].server";

export function UnitPurpose({ unit, canEdit }: Pick<Props, "unit" | "canEdit">) {
  const [editing, setEditing] = useState(false);
  const form = useForm("/units/:id", { purpose: unit.purpose, summary: unit.summary }, { params: { id: String(unit.id) } });
  useEffect(() => {
    if (form.wasSuccessful) setEditing(false);
  }, [form.wasSuccessful]);

  return (
    <Card as="section" size="large">
      <SectionHeader>
        <Icon name="flag-line" className="text-muted" />
        <h2 className="text-heading font-bold text-text">何のためにやっているか</h2>
        <span className="flex-1" />
        {canEdit && !editing && (
          <IconButton  onClick={() => setEditing(true)} title="編集" aria-label="編集">
            <Icon name="pencil-line" />
          </IconButton>
        )}
      </SectionHeader>
      {editing ? (
        <Form form={form}>
          <Field>
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 [&_label]:m-0 [&_label]:whitespace-nowrap">
              <Label htmlFor="purpose">目的</Label>
              <span className="text-caption font-normal text-muted">一文で。新入生が読んでもわかるように</span>
            </div>
            <Input id="purpose" type="text" value={form.data.purpose} onChange={(e) => form.setData("purpose", e.target.value)} />
          </Field>
          <Field>
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 [&_label]:m-0 [&_label]:whitespace-nowrap">
              <Label htmlFor="summary">概要</Label>
            </div>
            <Textarea id="summary" value={form.data.summary} onChange={(e) => form.setData("summary", e.target.value)} />
          </Field>
          <Row>
            <span className="flex-1" />
            <Button type="button"  variant="ghost" onClick={() => setEditing(false)}>
              やめる
            </Button>
            <Button type="submit"  variant="primary" disabled={form.pending}>
              保存
            </Button>
          </Row>
        </Form>
      ) : (
        <>
          <p className="mb-2 text-heading leading-relaxed font-bold">{unit.purpose || <span className="text-muted">（まだ書かれていません）</span>}</p>
          {unit.summary && <p className="whitespace-pre-wrap text-meta text-text-2 m-0">{unit.summary}</p>}
        </>
      )}
    </Card>
  );
}
