import { type Props } from "../../pages/index.server";
import { RecordPill } from "../domain";
import { Badge, Card, EmptyState, Icon, Link, List, SectionHeader } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type PendingSummaryProps = Pick<Props, "pending">;

type PendingRecord = Props["pending"][number];

export function PendingSummary({ pending }: PendingSummaryProps) {
  const hasNoPendingRecords = pending.length === 0;

  function hasUnitName(p: PendingRecord) {
    return Boolean(p.unitName);
  }

  return (
    <Card as="section" className="mt-10">
      <SectionHeader>
        <Icon name="arrow-go-forward-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>持ち越し中</h2>
        <Badge>{pending.length}</Badge>
      </SectionHeader>
      {hasNoPendingRecords ? (
        <EmptyState>持ち越しているものはありません</EmptyState>
      ) : (
        <List>
          {pending.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3">
              <RecordPill kind={p.kind} />
              <span className="flex-1 min-w-0">{p.title}</span>
              {hasUnitName(p) && <span className={textStyles({ role: "meta" })}>{p.unitName}</span>}
            </li>
          ))}
        </List>
      )}
      <Link href="/records?status=pending" className="mt-4 inline-flex items-center gap-1 text-meta font-semibold text-accent hover:underline">
        記録を見る <Icon name="arrow-right-line" />
      </Link>
    </Card>
  );
}
