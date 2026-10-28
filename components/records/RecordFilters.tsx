import { useRouter } from "@void/react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { RECORD_KIND_LABEL, type RecordKind } from "../../lib/domain";
import { type Props } from "../../pages/records/index.server";
import { Badge, Card, Icon, Input, Row, Select } from "../ui";

type RecordFiltersProps = Pick<Props, "filter" | "list" | "unitList">;

export function RecordFilters({ filter, list, unitList }: RecordFiltersProps) {
  const router = useRouter();
  const [q, setQ] = useState(filter.q);
  const selectedUnitValue = filter.unitId ?? "";

  function go(patch: Partial<Record<"q" | "kind" | "unit" | "status", string>>) {
    const next = {
      q: filter.q,
      kind: filter.kind,
      unit: filter.unitId ? String(filter.unitId) : "",
      status: filter.status,
      ...patch,
    };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v)).toString();
    router.visit(`/records${qs ? `?${qs}` : ""}`, { preserveScroll: true });
  }

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    go({ q });
  }

  function handleQueryChange(e: ChangeEvent<HTMLInputElement>) {
    setQ(e.target.value);
  }

  function handleKindFilterChange(e: ChangeEvent<HTMLSelectElement>) {
    go({ kind: e.target.value });
  }

  function handleUnitFilterChange(e: ChangeEvent<HTMLSelectElement>) {
    go({ unit: e.target.value });
  }

  function handleStatusFilterChange(e: ChangeEvent<HTMLSelectElement>) {
    go({ status: e.target.value });
  }

  return (
    <Card className="flex flex-col gap-3">
      <form
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1 focus-within:border-accent focus-within:outline-3 focus-within:outline-accent-soft [&_i]:text-lg [&_i]:text-muted [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:py-2 [&_input:focus]:outline-none"
        onSubmit={handleSearch}
      >
        <Icon name="search-line" />
        <Input type="search" value={q} onChange={handleQueryChange} placeholder="キーワードで探す（例: MVV、予算、HP）" aria-label="キーワード" />
      </form>
      <Row>
        <Select value={filter.kind} onChange={handleKindFilterChange} compact aria-label="種類">
          <option value="">すべての種類</option>
          {(Object.keys(RECORD_KIND_LABEL) as RecordKind[]).map((k) => (
            <option key={k} value={k}>
              {RECORD_KIND_LABEL[k]}
            </option>
          ))}
        </Select>
        <Select value={selectedUnitValue} onChange={handleUnitFilterChange} compact aria-label="ユニット">
          <option value="">すべてのユニット</option>
          {unitList.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Select value={filter.status} onChange={handleStatusFilterChange} compact aria-label="状態">
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
