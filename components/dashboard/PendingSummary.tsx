import { Link } from "@void/react";
import type { Props } from "../../pages/index.server";
import { RecordPill } from "../domain";
import { Badge, Card, EmptyState, Icon, SectionHeader } from "../ui";

type PendingSummaryProps = Pick<Props, "pending">;

export function PendingSummary({ pending }: PendingSummaryProps) {
  const hasNoPendingRecords = pending.length === 0;
  function hasUnitName(p: (typeof pending)[number]) { return p.unitName; }

  return (
    <Card as="section" className="card section">
      <SectionHeader className="section-head">
        <Icon name="arrow-go-forward-line" className="muted" />
        <h2>持ち越し中</h2>
        <Badge className="count">{pending.length}</Badge>
      </SectionHeader>
      {hasNoPendingRecords ? (
        <EmptyState className="empty">持ち越しているものはありません</EmptyState>
      ) : (
        <ul className="list">
          {pending.map((p) => (
            <li key={p.id} className="row" style={{ gap: 12 }}>
              <RecordPill kind={p.kind} />
              <span style={{ flex: 1, minWidth: 0 }}>{p.title}</span>
              {hasUnitName(p) && <span className="meta">{p.unitName}</span>}
            </li>
          ))}
        </ul>
      )}
      <Link href="/records?status=pending" className="more">
        記録を見る <Icon name="arrow-right-line" />
      </Link>
    </Card>
  );
}
