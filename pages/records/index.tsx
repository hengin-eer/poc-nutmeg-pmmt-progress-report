import { action, Link, useRouter } from "@void/react";
import { useState } from "react";
import { RecordPill } from "../../components/ui";
import { formatJstDate, RECORD_KIND_LABEL, type RecordKind } from "../../lib/domain";
import type { Props } from "./index.server";

export default function RecordsPage({ me, filter, list, unitList }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(filter.q);

  const go = (patch: Partial<Record<"q" | "kind" | "unit" | "status", string>>) => {
    const next = {
      q: filter.q,
      kind: filter.kind,
      unit: filter.unitId ? String(filter.unitId) : "",
      status: filter.status,
      ...patch,
    };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v)).toString();
    router.visit(`/records${qs ? `?${qs}` : ""}`, { preserveScroll: true });
  };
  const exportQs = new URLSearchParams(
    Object.entries({ q: filter.q, kind: filter.kind, unit: filter.unitId ? String(filter.unitId) : "", status: filter.status }).filter(([, v]) => v),
  ).toString();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>記録</h1>
          <div className="sub">決まったこと・TODO・先送りした議題を、回をまたいで探せます</div>
        </div>
        <a className="button" href={`/api/records.md${exportQs ? `?${exportQs}` : ""}`} target="_blank" rel="noreferrer">
          Markdown で書き出す
        </a>
      </div>

      <div className="card stack">
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            go({ q });
          }}
        >
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="キーワード（例: MVV、予算、HP）" style={{ flex: 1, minWidth: 200 }} />
          <button type="submit" className="primary">
            検索
          </button>
        </form>
        <div className="row">
          <select value={filter.kind} onChange={(e) => go({ kind: e.target.value })} style={{ width: "auto" }} aria-label="種類">
            <option value="">すべての種類</option>
            {(Object.keys(RECORD_KIND_LABEL) as RecordKind[]).map((k) => (
              <option key={k} value={k}>
                {RECORD_KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <select value={filter.unitId ?? ""} onChange={(e) => go({ unit: e.target.value })} style={{ width: "auto" }} aria-label="ユニット">
            <option value="">すべてのユニット</option>
            {unitList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select value={filter.status} onChange={(e) => go({ status: e.target.value })} style={{ width: "auto" }} aria-label="状態">
            <option value="">すべての状態</option>
            <option value="pending">持ち越し中</option>
            <option value="done">終わったもの</option>
          </select>
          <span className="spacer" />
          <span className="meta">{list.length} 件</span>
        </div>
      </div>

      <div className="card section">
        {list.length === 0 ? (
          <p className="empty">見つかりませんでした</p>
        ) : (
          <ul className="list">
            {list.map((r) => {
              const toggleable = r.kind !== "decision" && (me.isAdmin || r.unitId === me.unitId);
              return (
                <li key={r.id}>
                  <div className="row" style={{ marginBottom: 2 }}>
                    {r.kind !== "decision" && (
                      <input
                        type="checkbox"
                        checked={Boolean(r.doneAt)}
                        disabled={!toggleable}
                        aria-label="終わった"
                        onChange={(e) => action("/records?toggle", { data: { id: r.id, done: e.target.checked } })}
                      />
                    )}
                    <RecordPill kind={r.kind} />
                    <strong style={{ textDecoration: r.doneAt && r.kind !== "decision" ? "line-through" : undefined }}>{r.title}</strong>
                  </div>
                  {r.body && <div className="body meta">{r.body}</div>}
                  <div className="meta">
                    {formatJstDate(r.meetingAt)} の PMMT
                    {r.unitName && <> ・ {r.unitName}</>}
                    {r.source === "minutes" && " ・ 議事録から"}
                    {r.sourceItemId && (
                      <>
                        {" ・ "}
                        <Link href={`/items/${r.sourceItemId}`}>元のスレッド</Link>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
