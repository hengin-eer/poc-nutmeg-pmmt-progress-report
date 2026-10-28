import { useRouter } from "@void/react";
import { useState } from "react";
import { Badge, Card, Icon, Input, Row, Select } from "../ui";
import { RECORD_KIND_LABEL, type RecordKind } from "../../lib/domain";
import { type Props } from "../../pages/records/index.server";

export function RecordFilters({ filter, list, unitList }: Pick<Props, "filter" | "list" | "unitList">) {
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
    <Card className="flex flex-col gap-4 gap-3">
      <form
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1 focus-within:border-accent focus-within:outline-3 focus-within:outline-accent-soft [&_i]:text-lg [&_i]:text-muted [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:py-2 [&_input:focus]:outline-none"
        onSubmit={(e) => {
          e.preventDefault();
          go({ q });
        }}
      >
        <Icon name="search-line" />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="キーワードで探す（例: MVV、予算、HP）" aria-label="キーワード" />
      </form>
      <Row>
        <Select value={filter.kind} onChange={(e) => go({ kind: e.target.value })} className="w-auto px-2 py-2 text-meta" aria-label="種類">
          <option value="">すべての種類</option>
          {(Object.keys(RECORD_KIND_LABEL) as RecordKind[]).map((k) => (
            <option key={k} value={k}>
              {RECORD_KIND_LABEL[k]}
            </option>
          ))}
        </Select>
        <Select value={filter.unitId ?? ""} onChange={(e) => go({ unit: e.target.value })} className="w-auto px-2 py-2 text-meta" aria-label="ユニット">
          <option value="">すべてのユニット</option>
          {unitList.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Select value={filter.status} onChange={(e) => go({ status: e.target.value })} className="w-auto px-2 py-2 text-meta" aria-label="状態">
          <option value="">すべての状態</option>
          <option value="pending">持ち越し中</option>
          <option value="done">終わったもの</option>
        </Select>
        <span className="flex-1" />
        <Badge>{list.length} 件</Badge>
      </Row>
    </Card>
  );
}
