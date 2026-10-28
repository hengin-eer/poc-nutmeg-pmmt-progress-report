import type { ChangeEvent } from "react";
import { Form, useForm } from "@void/react";
import { useEffect, useState } from "react";
import { Button, Card, Field, Icon, IconButton, SectionHeader } from "../ui";
import { type Props } from "../../pages/units/[id].server";

type UnitPurposeProps = Pick<Props, "unit" | "canEdit">;

export function UnitPurpose({ unit, canEdit }: UnitPurposeProps) {
  const [editing, setEditing] = useState(false);
  const form = useForm("/units/:id", { purpose: unit.purpose, summary: unit.summary }, { params: { id: String(unit.id) } });
  useEffect(() => {
    if (form.wasSuccessful) setEditing(false);
  }, [form.wasSuccessful]);

  function handleStartEditing() { return setEditing(true); }

  function handlePurposeChange(e: ChangeEvent<HTMLInputElement>) { return form.setData("purpose", e.target.value); }

  function handleSummaryChange(e: ChangeEvent<HTMLTextAreaElement>) { return form.setData("summary", e.target.value); }

  function handleCancelEditing() { return setEditing(false); }

  const canStartEditing = canEdit && !editing;
  const purposeText = unit.purpose;
  const hasPurpose = Boolean(purposeText);
  const hasUnitSummary = unit.summary;

  return (
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head">
        <Icon name="flag-line" className="muted" />
        <h2>何のためにやっているか</h2>
        <span className="spacer" />
        {canStartEditing && (
          <IconButton className="icon-button" onClick={handleStartEditing} title="編集" aria-label="編集">
            <Icon name="pencil-line" />
          </IconButton>
        )}
      </SectionHeader>
      {editing ? (
        <Form form={form}>
          <Field className="field">
            <div className="field-label">
              <label htmlFor="purpose">目的</label>
              <span className="hint">一文で。新入生が読んでもわかるように</span>
            </div>
            <input id="purpose" type="text" value={form.data.purpose} onChange={handlePurposeChange} />
          </Field>
          <Field className="field">
            <div className="field-label">
              <label htmlFor="summary">概要</label>
            </div>
            <textarea id="summary" value={form.data.summary} onChange={handleSummaryChange} />
          </Field>
          <div className="row">
            <span className="spacer" />
            <Button type="button" className="ghost" onClick={handleCancelEditing}>
              やめる
            </Button>
            <Button type="submit" className="primary" disabled={form.pending}>
              保存
            </Button>
          </div>
        </Form>
      ) : (
        <>
          <p className="purpose">{hasPurpose ? purposeText : <span className="muted">（まだ書かれていません）</span>}</p>
          {hasUnitSummary && <p className="md" style={{ margin: 0 }}>{unit.summary}</p>}
        </>
      )}
    </Card>
  );
}
