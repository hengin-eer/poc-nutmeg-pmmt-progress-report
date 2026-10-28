
import type { Props } from "../../pages/index.server";
import { RecordPill } from "../domain";
import { Badge, Card, EmptyState, Icon, Link, List, SectionHeader } from "../ui";

export function PendingSummary({ pending }: Pick<Props, "pending">) {
  return (
    <Card as="section" className="mt-10">
      <SectionHeader>
        <Icon name="arrow-go-forward-line" className="text-muted" />
        <h2 className="text-heading font-bold text-text">持ち越し中</h2>
        <Badge>{pending.length}</Badge>
      </SectionHeader>
      {pending.length === 0 ? (
        <EmptyState>持ち越しているものはありません</EmptyState>
      ) : (
        <List>
          {pending.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2 gap-3">
              <RecordPill kind={p.kind} />
              <span className="flex-1 min-w-0">{p.title}</span>
              {p.unitName && <span className="text-caption text-muted">{p.unitName}</span>}
            </li>
          ))}
        </List>
      )}
      <Link href="/records?status=pending"  className="mt-4 inline-flex items-center gap-1 text-meta font-semibold text-accent hover:underline">
        記録を見る <Icon name="arrow-right-line" />
      </Link>
    </Card>
  );
}
