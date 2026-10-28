import { action, useRouter } from "@void/react";
import { useState } from "react";
import { useThread } from "../../components/thread";
import { Badge, Button, Card, EmptyState, Icon, PageHeader } from "../../components/ui";
import { RecordPill, SourceBadge } from "../../components/domain";
import { formatJstDate, RECORD_KIND_LABEL, type RecordKind } from "../../lib/domain";
import type { Props } from "./index.server";

export default function RecordsPage({ me, filter, list, unitList }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(filter.q);
  const { open } = useThread();

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
      <PageHeader className="page-head">
        <div>
          <h1>記録</h1>
          <div className="lead">決まったこと・TODO・先送りした議題を、回をまたいで探せます</div>
        </div>
        <a className="button" href={`/api/records.md${exportQs ? `?${exportQs}` : ""}`} target="_blank" rel="noreferrer">
          <Icon name="download-2-line" />
          Markdown
        </a>
      </PageHeader>

      <Card className="card stack" style={{ gap: 14 }}>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            go({ q });
          }}
        >
          <Icon name="search-line" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="キーワードで探す（例: MVV、予算、HP）" aria-label="キーワード" />
        </form>
        <div className="row">
          <select value={filter.kind} onChange={(e) => go({ kind: e.target.value })} className="filter" aria-label="種類">
            <option value="">すべての種類</option>
            {(Object.keys(RECORD_KIND_LABEL) as RecordKind[]).map((k) => (
              <option key={k} value={k}>
                {RECORD_KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <select value={filter.unitId ?? ""} onChange={(e) => go({ unit: e.target.value })} className="filter" aria-label="ユニット">
            <option value="">すべてのユニット</option>
            {unitList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select value={filter.status} onChange={(e) => go({ status: e.target.value })} className="filter" aria-label="状態">
            <option value="">すべての状態</option>
            <option value="pending">持ち越し中</option>
            <option value="done">終わったもの</option>
          </select>
          <span className="spacer" />
          <Badge className="count">{list.length} 件</Badge>
        </div>
      </Card>

      <Card className="card section">
        {list.length === 0 ? (
          <EmptyState className="empty">見つかりませんでした</EmptyState>
        ) : (
          <ul className="list">
            {list.map((r) => {
              const toggleable = r.kind !== "decision" && (me.isAdmin || r.unitId === me.unitId);
              const done = Boolean(r.doneAt) && r.kind !== "decision";
              return (
                <li key={r.id} className="record">
                  <div className="record-check">
                    {r.kind !== "decision" && (
                      <input
                        type="checkbox"
                        checked={Boolean(r.doneAt)}
                        disabled={!toggleable}
                        aria-label="終わった"
                        onChange={(e) => action("/records?toggle", { data: { id: r.id, done: e.target.checked } })}
                      />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className={`record-title ${done ? "done" : ""}`}>{r.title}</div>
                    {r.body && <div className="record-body">{r.body}</div>}
                    <div className="record-meta">
                      <RecordPill kind={r.kind} />
                      {r.unitName && <span className="record-unit">{r.unitName}</span>}
                      <span className="meta">{formatJstDate(r.meetingAt)}</span>
                      <span className="spacer" />
                      {r.source === "thread" && r.sourceItemId ? (
                        <Button type="button" className="source source-thread" onClick={() => open(r.sourceItemId!)} title="元のスレッドを開く">
                          <Icon name="chat-3-line" />
                          スレッド
                        </Button>
                      ) : (
                        <SourceBadge source={r.source} />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
