import { Form } from "@void/react";
import { Button, Card, EmptyState, Field, SectionHeader } from "../ui";
import { RecordPill } from "../domain";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/admin/import.server";
import { type ImportState } from "./useMinutesImport";

type MinutesCandidatesProps = Props & { state: ImportState };

export function MinutesCandidates({ cycles, units, state }: MinutesCandidatesProps) {
  const { rows, form, summary, setSummary, update, selected } = state;
  return (
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head"><span className="step">2</span><h2>確認して登録する</h2></SectionHeader>
      {rows.length === 0 ? (
        <EmptyState className="empty">左に貼り付けて「候補に分ける」を押してください</EmptyState>
      ) : (
        <Form
          form={form}
          onSubmitCapture={() => {
            form.setData("summary", summary);
            form.setData(
              "entries",
              selected.map(({ kind, title, body, unitId }) => ({ kind, title, body, unitId })),
            );
          }}
        >
          <Field className="field">
            <label>どの回の議事録か</label>
            <select value={form.data.cycleId} onChange={(e) => form.setData("cycleId", Number(e.target.value))}>
              <option value={0}>選んでください</option>
              {cycles.map((cy) => (
                <option key={cy.id} value={cy.id}>
                  {formatJst(cy.meetingAt)}
                  {cy.status === "open" ? "（受付中）" : ""}
                </option>
              ))}
            </select>
            {form.errors.cycleId && <div className="error">{form.errors.cycleId}</div>}
          </Field>

          <ul className="list" style={{ marginBottom: 12 }}>
            {rows.map((r, i) => (
              <li key={i} className="stack" style={{ gap: 6 }}>
                <div className="row">
                  <input type="checkbox" checked={r.checked} onChange={(e) => update(i, { checked: e.target.checked })} aria-label="登録する" />
                  <RecordPill kind={r.kind} />
                  <select value={r.unitId ?? ""} onChange={(e) => update(i, { unitId: e.target.value ? Number(e.target.value) : null })} style={{ width: "auto", padding: "2px 6px", fontSize: 13 }}>
                    <option value="">ユニットなし</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {r.unitName && r.unitId === null && <span className="error">「{r.unitName}」が見つかりません</span>}
                </div>
                <input type="text" value={r.title} onChange={(e) => update(i, { title: e.target.value })} />
                {r.body && <div className="meta body">{r.body}</div>}
              </li>
            ))}
          </ul>

          {summary && (
            <Field className="field">
              <label>要約 <span className="hint">回の要約として保存されます</span></label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
            </Field>
          )}
          {form.errors.entries && <div className="error">{form.errors.entries}</div>}
          <Button type="submit" className="primary" disabled={form.pending || selected.length === 0}>
            {selected.length} 件を登録する
          </Button>
        </Form>
      )}
    </Card>
  );
}
