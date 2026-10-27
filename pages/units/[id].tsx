import { Form, Link, useForm } from "@void/react";
import { useEffect, useState } from "react";
import { Busy, CrossBureau, KindLabel, ProgressPill, RecordPill, StatePill, UNIT_KIND_LABEL } from "../../components/ui";
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
          <div className="sub">{UNIT_KIND_LABEL[unit.kind]}</div>
          <h1>{unit.name}</h1>
          <div className="sub">{people.map((p) => p.name).join("、")}</div>
        </div>
      </div>

      <section className="card">
        <div className="row">
          <h2 style={{ margin: 0 }}>何のためにやっているか</h2>
          <span className="spacer" />
          {canEdit && !editing && (
            <button className="small" onClick={() => setEditing(true)}>
              編集
            </button>
          )}
        </div>
        {editing ? (
          <Form form={form} style={{ marginTop: 12 }}>
            <div className="field">
              <label htmlFor="purpose">目的 <span className="hint">一文で。新入生が読んでもわかるように</span></label>
              <input id="purpose" type="text" value={form.data.purpose} onChange={(e) => form.setData("purpose", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="summary">概要</label>
              <textarea id="summary" value={form.data.summary} onChange={(e) => form.setData("summary", e.target.value)} />
            </div>
            <div className="row">
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
            <p style={{ fontSize: 17, fontWeight: 600, margin: "12px 0 6px" }}>{unit.purpose || "（まだ書かれていません）"}</p>
            <p className="body sub" style={{ margin: 0 }}>{unit.summary}</p>
          </>
        )}
      </section>

      <div className="grid grid-2 section">
        <section>
          <h2>週ごとの更新</h2>
          {history.length === 0 && <p className="empty">まだ提出された記入はありません</p>}
          <div className="stack">
            {history.map((h) => (
              <article key={h.cycleId} className="card">
                <div className="row" style={{ marginBottom: 8 }}>
                  <strong>{formatJstDate(h.meetingAt)} の PMMT</strong>
                  <span className="spacer" />
                  <ProgressPill value={h.progress} />
                  <Busy value={h.busyness} />
                </div>
                {h.done && (
                  <>
                    <div className="meta">やったこと</div>
                    <div className="md">{h.done}</div>
                  </>
                )}
                {h.next && (
                  <>
                    <div className="meta" style={{ marginTop: 8 }}>次にやること</div>
                    <div className="md">{h.next}</div>
                  </>
                )}
                {h.items.length > 0 && (
                  <ul className="list" style={{ marginTop: 12 }}>
                    {h.items.map((i) => (
                      <li key={i.id}>
                        <Link href={`/items/${i.id}`} style={{ color: "inherit" }}>
                          <div className="row">
                            <KindLabel kind={i.kind} />
                            <StatePill state={i.state} />
                            <CrossBureau on={i.crossBureau} />
                          </div>
                          <div className="body" style={{ fontSize: 14 }}>{i.body}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>このユニットの記録</h2>
          <div className="card">
            {records.length === 0 ? (
              <p className="empty">まだ記録はありません</p>
            ) : (
              <ul className="list">
                {records.map((r) => (
                  <li key={r.id}>
                    <div className="row">
                      <RecordPill kind={r.kind} />
                      <span style={{ textDecoration: r.doneAt && r.kind !== "decision" ? "line-through" : undefined }}>{r.title}</span>
                    </div>
                    <div className="meta">{formatJstDate(r.meetingAt)} の PMMT</div>
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
