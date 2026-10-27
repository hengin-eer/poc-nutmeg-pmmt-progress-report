import { Form, useForm } from "@void/react";
import { useEffect, useState } from "react";
import { ItemRow } from "../../components/thread";
import { Busy, Icon, ProgressPill, RecordPill, UNIT_KIND_LABEL } from "../../components/ui";
import { formatJstDate } from "../../lib/domain";
import type { Props } from "./[id].server";

export default function UnitPage({ unit, people, history, records, canEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const form = useForm("/units/:id", { purpose: unit.purpose, summary: unit.summary }, { params: { id: String(unit.id) } });
  useEffect(() => {
    if (form.wasSuccessful) setEditing(false);
  }, [form.wasSuccessful]);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">{UNIT_KIND_LABEL[unit.kind]}</div>
          <h1>{unit.name}</h1>
          {people.length > 0 && (
            <div className="sub row" style={{ marginTop: 6 }}>
              <Icon name="group-line" />
              {people.map((p) => p.name).join("、")}
            </div>
          )}
        </div>
      </div>

      <section className="card card-lg">
        <div className="section-head">
          <Icon name="flag-line" className="muted" />
          <h2>何のためにやっているか</h2>
          <span className="spacer" />
          {canEdit && !editing && (
            <button className="icon-button" onClick={() => setEditing(true)} title="編集" aria-label="編集">
              <Icon name="pencil-line" />
            </button>
          )}
        </div>
        {editing ? (
          <Form form={form}>
            <div className="field">
              <div className="field-label">
                <label htmlFor="purpose">目的</label>
                <span className="hint">一文で。新入生が読んでもわかるように</span>
              </div>
              <input id="purpose" type="text" value={form.data.purpose} onChange={(e) => form.setData("purpose", e.target.value)} />
            </div>
            <div className="field">
              <div className="field-label">
                <label htmlFor="summary">概要</label>
              </div>
              <textarea id="summary" value={form.data.summary} onChange={(e) => form.setData("summary", e.target.value)} />
            </div>
            <div className="row">
              <span className="spacer" />
              <button type="button" className="ghost" onClick={() => setEditing(false)}>
                やめる
              </button>
              <button type="submit" className="primary" disabled={form.pending}>
                保存
              </button>
            </div>
          </Form>
        ) : (
          <>
            <p className="purpose">{unit.purpose || <span className="muted">（まだ書かれていません）</span>}</p>
            {unit.summary && <p className="md" style={{ margin: 0 }}>{unit.summary}</p>}
          </>
        )}
      </section>

      <div className="grid grid-2 section">
        <section>
          <div className="section-head">
            <h2>週ごとの更新</h2>
          </div>
          {history.length === 0 && <p className="empty">まだ提出された記入はありません</p>}
          <div className="stack" style={{ gap: 20 }}>
            {history.map((h) => (
              <article key={h.cycleId} className="card">
                <div className="row" style={{ marginBottom: 14 }}>
                  <strong>{formatJstDate(h.meetingAt)}</strong>
                  <span className="spacer" />
                  <ProgressPill value={h.progress} />
                  <Busy value={h.busyness} label />
                </div>
                {h.done && (
                  <div className="report-block">
                    <h3>やったこと</h3>
                    <div className="md">{h.done}</div>
                  </div>
                )}
                {h.next && (
                  <div className="report-block">
                    <h3>次にやること</h3>
                    <div className="md">{h.next}</div>
                  </div>
                )}
                {h.items.length > 0 && (
                  <ul className="list" style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                    {h.items.map((i) => (
                      <ItemRow key={i.id} item={i} />
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="section-head">
            <h2>このユニットの記録</h2>
            <span className="count">{records.length}</span>
          </div>
          <div className="card">
            {records.length === 0 ? (
              <p className="empty">まだ記録はありません</p>
            ) : (
              <ul className="list">
                {records.map((r) => (
                  <li key={r.id}>
                    <div className={`record-title ${r.doneAt && r.kind !== "decision" ? "done" : ""}`} style={{ fontSize: 15 }}>
                      {r.title}
                    </div>
                    <div className="record-meta" style={{ marginTop: 6 }}>
                      <RecordPill kind={r.kind} />
                      <span className="meta">{formatJstDate(r.meetingAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
