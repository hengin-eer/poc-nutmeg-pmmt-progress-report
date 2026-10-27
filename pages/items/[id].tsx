import { action, Form, Link, useForm } from "@void/react";
import { useState } from "react";
import { CrossBureau, KindLabel, StatePill } from "../../components/ui";
import { formatJst, ITEM_STATE_LABEL, type ItemState } from "../../lib/domain";
import type { Props } from "./[id].server";

const CLOSE_HINT: Partial<Record<ItemState, string>> = {
  decided: "決まった内容を一言で（「決まったこと」の記録に残ります）",
  live: "PMMT 当日の議題一覧に並びます",
  resolved: "返信で片付いた時に",
  deferred: "次回以降に持ち越す理由など（「先送りした議題」の記録に残ります）",
  open: "もう一度、未解決に戻します",
};

export default function ItemPage({ item, unit, cycle, authorName, closedByName, thread, reactionSummary, canClose, nextStates }: Props) {
  const params = { id: String(item.id) };
  const commentForm = useForm("/items/:id?comment", { body: "" }, { params, resetOnSuccess: true });

  return (
    <>
      <div className="sub" style={{ marginBottom: 8 }}>
        <Link href="/items">← 確認事項</Link>
      </div>

      <article className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <Link href={`/units/${unit.id}`}>
            <strong>{unit.name}</strong>
          </Link>
          <KindLabel kind={item.kind} />
          <StatePill state={item.state} />
          <CrossBureau on={item.crossBureau} />
          <span className="spacer" />
          <span className="meta">
            {authorName} ・ {formatJst(item.createdAt)} ・ {formatJst(cycle.meetingAt)} の PMMT
          </span>
        </div>
        <div className="body" style={{ fontSize: 16 }}>
          {item.body}
        </div>
        {item.resolutionNote && (
          <p className="notice" style={{ marginTop: 12 }}>
            <strong>{ITEM_STATE_LABEL[item.state]}</strong>：{item.resolutionNote}
            {closedByName && <span className="meta">（{closedByName}）</span>}
          </p>
        )}
        <div className="reactions" style={{ marginTop: 12 }}>
          {reactionSummary.map((r) => (
            <button
              key={r.emoji}
              className={`reaction ${r.mine ? "mine" : ""}`}
              title={r.names.join("、") || "リアクションする"}
              onClick={() => action("/items/:id?react", { params, data: { emoji: r.emoji } })}
            >
              {r.emoji} {r.count > 0 && r.count}
            </button>
          ))}
        </div>
      </article>

      {canClose && <ClosePanel key={item.state} params={params} nextStates={nextStates} />}

      <section className="card section">
        <h2>
          スレッド <span className="pill">{thread.length}</span>
        </h2>
        {thread.length === 0 ? (
          <p className="empty">まだコメントはありません。最初の一言をどうぞ。</p>
        ) : (
          <ul className="list" style={{ marginBottom: 16 }}>
            {thread.map((t) => (
              <li key={t.id}>
                <div className="row">
                  <strong>{t.author}</strong>
                  <span className="meta">{formatJst(t.createdAt)}</span>
                </div>
                <div className="body">{t.body}</div>
              </li>
            ))}
          </ul>
        )}
        <Form form={commentForm}>
          <div className="field">
            <textarea value={commentForm.data.body} onChange={(e) => commentForm.setData("body", e.target.value)} placeholder="コメントする" />
            {commentForm.errors.body && <div className="error">{commentForm.errors.body}</div>}
          </div>
          <button type="submit" className="primary" disabled={commentForm.pending}>
            コメント
          </button>
        </Form>
      </section>
    </>
  );
}

function ClosePanel({ params, nextStates }: { params: { id: string }; nextStates: Props["nextStates"] }) {
  const form = useForm("/items/:id?close", { state: nextStates[0] ?? "open", note: "" }, { params });
  const [chosen, setChosen] = useState<ItemState | null>(null);

  return (
    <section className="card section">
      <h2>この確認事項を閉じる</h2>
      <div className="choices" style={{ marginBottom: 12 }}>
        {nextStates.map((s) => (
          <button
            key={s}
            type="button"
            className={`choice ${chosen === s ? "selected" : ""}`}
            onClick={() => {
              setChosen(s);
              form.setData("state", s);
            }}
          >
            {s === "open" ? "未解決に戻す" : ITEM_STATE_LABEL[s]}
          </button>
        ))}
      </div>
      {chosen && (
        <Form form={form}>
          <div className="field">
            <label className="hint">{CLOSE_HINT[chosen]}</label>
            {chosen !== "open" && chosen !== "live" && (
              <input type="text" value={form.data.note} onChange={(e) => form.setData("note", e.target.value)} placeholder={chosen === "decided" ? "例: 1 週間後ろにずらす。新しい期限は 11/20" : "任意"} />
            )}
            {form.errors.note && <div className="error">{form.errors.note}</div>}
            {form.errors.state && <div className="error">{form.errors.state}</div>}
            {form.error && <div className="error">{form.error.message}</div>}
          </div>
          <button type="submit" className="primary" disabled={form.pending}>
            {chosen === "open" ? "未解決に戻す" : `「${ITEM_STATE_LABEL[chosen]}」にする`}
          </button>
        </Form>
      )}
    </section>
  );
}
