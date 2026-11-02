import { Form, useForm } from "@void/react";
import { useEffect, useState, type ChangeEvent } from "react";
import { type Props } from "../../pages/units/[id].server";
import { Button, Card, Field, FieldLabel, Icon, IconButton, Input, Label, Row, SectionHeader, Textarea } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type UnitPurposeProps = Pick<Props, "unit" | "canEdit">;

export function UnitPurpose({ unit, canEdit }: UnitPurposeProps) {
  const [editing, setEditing] = useState(false);
  const form = useForm("/units/:id", { purpose: unit.purpose, summary: unit.summary }, { params: { id: String(unit.id) } });

  useEffect(() => {
    if (form.wasSuccessful) setEditing(false);
  }, [form.wasSuccessful]);

  const canStartEditing = canEdit && !editing;
  const purposeText = unit.purpose;
  const hasPurpose = Boolean(purposeText);
  const hasUnitSummary = Boolean(unit.summary);

  function handleStartEditing() {
    setEditing(true);
  }

  function handlePurposeChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("purpose", e.target.value);
  }

  function handleSummaryChange(e: ChangeEvent<HTMLTextAreaElement>) {
    form.setData("summary", e.target.value);
  }

  function handleCancelEditing() {
    setEditing(false);
  }

  return (
    <Card as="section" size="large">
      <SectionHeader>
        <Icon name="flag-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>何のためにやっているか</h2>
        <span className="flex-1" />
        {canStartEditing && (
          <IconButton onClick={handleStartEditing} title="編集" aria-label="編集">
            <Icon name="pencil-line" />
          </IconButton>
        )}
      </SectionHeader>
      {editing ? (
        <Form form={form}>
          <Field>
            <FieldLabel>
              <Label htmlFor="purpose">目的</Label>
              <span className={textStyles({ role: "hint" })}>一文で。新入生が読んでもわかるように</span>
            </FieldLabel>
            <Input id="purpose" type="text" value={form.data.purpose} onChange={handlePurposeChange} />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="summary">概要</Label>
            </FieldLabel>
            <Textarea id="summary" value={form.data.summary} onChange={handleSummaryChange} />
          </Field>
          <Row>
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={handleCancelEditing}>
              やめる
            </Button>
            <Button type="submit" variant="primary" disabled={form.pending}>
              保存
            </Button>
          </Row>
        </Form>
      ) : (
        <>
          <p className="mb-2 text-heading leading-relaxed font-bold">{hasPurpose ? purposeText : <span className="text-muted">（まだ書かれていません）</span>}</p>
          {hasUnitSummary && <p className="whitespace-pre-wrap text-meta text-text-2 m-0">{unit.summary}</p>}
        </>
      )}
    </Card>
  );
}
