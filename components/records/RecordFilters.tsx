import { useRouter } from "@void/react";
import { useState } from "react";
import { Badge, Card, Icon } from "../ui";
import { RECORD_KIND_LABEL, type RecordKind } from "../../lib/domain";
import { type Props } from "../../pages/records/index.server";

type RecordFiltersProps = Pick<Props, "filter" | "list" | "unitList">;

export function RecordFilters({ filter, list, unitList }: RecordFiltersProps) {
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
  return (
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
  );
}
