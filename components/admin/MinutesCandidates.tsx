import { Form } from "@void/react";
import { type ChangeEvent } from "react";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/admin/import.server";
import { RecordPill } from "../domain";
import { Button, Card, Checkbox, EmptyState, Field, Input, Label, List, Row, SectionHeader, Select, Textarea } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";
import { type ImportState } from "./useMinutesImport";

type MinutesCandidatesProps = Props & { state: ImportState };

type Candidate = ImportState["rows"][number];

type Cycle = Props["cycles"][number];

export function MinutesCandidates({ cycles, units, state }: MinutesCandidatesProps) {
  const { rows, form, summary, setSummary, update, selected } = state;
  const hasNoCandidates = rows.length === 0;
  const hasCycleIdError = Boolean(form.errors.cycleId);
  const hasEntriesError = Boolean(form.errors.entries);
  const isImportDisabled = form.pending || selected.length === 0;

  function getCycleStatusSuffix(cy: Cycle) {
    return cy.status === "open" ? "（受付中）" : "";
  }

  function getCandidateUnitValue(r: Candidate) {
    return r.unitId ?? "";
  }

  function hasUnknownUnit(r: Candidate) {
    return Boolean(r.unitName && r.unitId === null);
  }

  function hasRecordDetails(r: Candidate) {
    return Boolean(r.body);
  }

  function handlePrepareImport() {
    form.setData("summary", summary);
    form.setData(
      "entries",
      selected.map(({ kind, title, body, unitId }) => ({ kind, title, body, unitId })),
    );
  }

  function handleCycleIdChange(e: ChangeEvent<HTMLSelectElement>) {
    form.setData("cycleId", Number(e.target.value));
  }

  function handleCandidateSelectionChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    update(i, { checked: e.target.checked });
  }

  function handleCandidateUnitChange(i: number, e: ChangeEvent<HTMLSelectElement>) {
    update(i, { unitId: e.target.value ? Number(e.target.value) : null });
  }

  function handleCandidateTitleChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    update(i, { title: e.target.value });
  }

  function handleSummaryTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setSummary(e.target.value);
  }

  return (
    <Card as="section" size="large">
      <SectionHeader><span className="grid size-6 shrink-0 place-items-center rounded-full bg-text text-caption font-extrabold text-bg">2</span><h2 className={headingStyles({ level: "heading" })}>確認して登録する</h2></SectionHeader>
      {hasNoCandidates ? (
        <EmptyState>左に貼り付けて「候補に分ける」を押してください</EmptyState>
      ) : (
        <Form
          form={form}
          onSubmitCapture={handlePrepareImport}
        >
          <Field>
            <Label>どの回の議事録か</Label>
            <Select value={form.data.cycleId} onChange={handleCycleIdChange}>
              <option value={0}>選んでください</option>
              {cycles.map((cy) => (
                <option key={cy.id} value={cy.id}>
                  {formatJst(cy.meetingAt)}
                  {getCycleStatusSuffix(cy)}
                </option>
              ))}
            </Select>
            {hasCycleIdError && <div className={textStyles({ role: "error" })}>{form.errors.cycleId}</div>}
          </Field>

          <List className="mb-3">
            {rows.map((r, i) => (
              <li key={i} className="flex flex-col gap-1">
                <Row>
                  <Checkbox checked={r.checked} onChange={e => handleCandidateSelectionChange(i, e)} aria-label="登録する" />
                  <RecordPill kind={r.kind} />
                  <Select value={getCandidateUnitValue(r)} onChange={e => handleCandidateUnitChange(i, e)} className="w-auto px-2 py-1 text-caption">
                    <option value="">ユニットなし</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </Select>
                  {hasUnknownUnit(r) && <span className={textStyles({ role: "error" })}>「{r.unitName}」が見つかりません</span>}
                </Row>
                <Input type="text" value={r.title} onChange={e => handleCandidateTitleChange(i, e)} />
                {hasRecordDetails(r) && <div className="text-caption text-muted whitespace-pre-wrap">{r.body}</div>}
              </li>
            ))}
          </List>

          {summary && (
            <Field>
              <Label>要約 <span className={textStyles({ role: "hint" })}>回の要約として保存されます</span></Label>
              <Textarea value={summary} onChange={handleSummaryTextChange} />
            </Field>
          )}
          {hasEntriesError && <div className={textStyles({ role: "error" })}>{form.errors.entries}</div>}
          <Button type="submit" variant="primary" disabled={isImportDisabled}>
            {selected.length} 件を登録する
          </Button>
        </Form>
      )}
    </Card>
  );
}
