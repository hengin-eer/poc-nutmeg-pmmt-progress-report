import type { ChangeEvent } from "react";
import { Form } from "@void/react";
import { Button, Card, EmptyState, Field, SectionHeader } from "../ui";
import { RecordPill } from "../domain";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/admin/import.server";
import { type ImportState } from "./useMinutesImport";

type MinutesCandidatesProps = Props & { state: ImportState };

export function MinutesCandidates({ cycles, units, state }: MinutesCandidatesProps) {
  const { rows, form, summary, setSummary, update, selected } = state;
  function handleSummaryChange() {
    form.setData("summary", summary);
    form.setData(
      "entries",
      selected.map(({ kind, title, body, unitId }) => ({ kind, title, body, unitId })),
    );
  }

  function handleCycleIdChange(e: ChangeEvent<HTMLSelectElement>) {
    return form.setData("cycleId", Number(e.target.value));
  }

  function handleCandidateSelectionChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    return update(i, { checked: e.target.checked });
  }

  function handleCandidateUnitChange(i: number, e: ChangeEvent<HTMLSelectElement>) {
    return update(i, { unitId: e.target.value ? Number(e.target.value) : null });
  }

  function handleCandidateTitleChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    return update(i, { title: e.target.value });
  }

  function handleSummaryChange6(e: ChangeEvent<HTMLTextAreaElement>) { return setSummary(e.target.value); }

  const hasNoCandidates = rows.length === 0;
  function getCycleStatusSuffix(cy: (typeof cycles)[number]) { return cy.status === "open" ? "（受付中）" : ""; }
  const hasCycleIdError = form.errors.cycleId;
  function getCandidateUnitValue(r: (typeof rows)[number]) { return r.unitId ?? ""; }
  function hasUnknownUnit(r: (typeof rows)[number]) { return r.unitName && r.unitId === null; }
  function hasRecordDetails(r: (typeof rows)[number]) { return r.body; }
  const hasEntriesError = form.errors.entries;
  const isImportDisabled = form.pending || selected.length === 0;

  return (
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head"><span className="step">2</span><h2>確認して登録する</h2></SectionHeader>
      {hasNoCandidates ? (
        <EmptyState className="empty">左に貼り付けて「候補に分ける」を押してください</EmptyState>
      ) : (
        <Form
          form={form}
          onSubmitCapture={handleSummaryChange}
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
              <textarea value={summary} onChange={handleSummaryChange6} />
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
