import { Form } from "@void/react";
import type { ChangeEvent } from "react";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/admin/import.server";
import { RecordPill } from "../domain";
import { Button, Card, EmptyState, Field, SectionHeader } from "../ui";
import { type ImportState } from "./useMinutesImport";

type Cycle = Props["cycles"][number];
type Candidate = ImportState["rows"][number];

type MinutesCandidatesProps = Props & { state: ImportState };

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
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head"><span className="step">2</span><h2>確認して登録する</h2></SectionHeader>
      {hasNoCandidates ? (
        <EmptyState className="empty">左に貼り付けて「候補に分ける」を押してください</EmptyState>
      ) : (
        <Form
          form={form}
          onSubmitCapture={handlePrepareImport}
        >
          <Field className="field">
            <label>どの回の議事録か</label>
            <select value={form.data.cycleId} onChange={handleCycleIdChange}>
              <option value={0}>選んでください</option>
              {cycles.map((cy) => (
                <option key={cy.id} value={cy.id}>
                  {formatJst(cy.meetingAt)}
                  {getCycleStatusSuffix(cy)}
                </option>
              ))}
            </select>
            {hasCycleIdError && <div className="error">{form.errors.cycleId}</div>}
          </Field>

          <ul className="list" style={{ marginBottom: 12 }}>
            {rows.map((r, i) => (
              <li key={i} className="stack" style={{ gap: 6 }}>
                <div className="row">
                  <input type="checkbox" checked={r.checked} onChange={e => handleCandidateSelectionChange(i, e)} aria-label="登録する" />
                  <RecordPill kind={r.kind} />
                  <select value={getCandidateUnitValue(r)} onChange={e => handleCandidateUnitChange(i, e)} style={{ width: "auto", padding: "2px 6px", fontSize: 13 }}>
                    <option value="">ユニットなし</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {hasUnknownUnit(r) && <span className="error">「{r.unitName}」が見つかりません</span>}
                </div>
                <input type="text" value={r.title} onChange={e => handleCandidateTitleChange(i, e)} />
                {hasRecordDetails(r) && <div className="meta body">{r.body}</div>}
              </li>
            ))}
          </ul>

          {summary && (
            <Field className="field">
              <label>要約 <span className="hint">回の要約として保存されます</span></label>
              <textarea value={summary} onChange={handleSummaryTextChange} />
            </Field>
          )}
          {hasEntriesError && <div className="error">{form.errors.entries}</div>}
          <Button type="submit" className="primary" disabled={isImportDisabled}>
            {selected.length} 件を登録する
          </Button>
        </Form>
      )}
    </Card>
  );
}
