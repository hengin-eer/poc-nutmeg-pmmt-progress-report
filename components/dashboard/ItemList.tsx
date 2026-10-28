import { ItemRow, type ItemSummary } from "../thread";
import { Badge, Card, EmptyState, Icon, Link, List, SectionHeader } from "../ui";
import { headingStyles } from "../ui/styles";

type ItemListProps = {
  title: string;
  icon: string;
  items: ItemSummary[];
  empty: string;
  moreHref?: string;
  moreLabel?: string;
};

export function ItemList({ title, icon, items, empty, moreHref, moreLabel }: ItemListProps) {
  const hasNoItems = items.length === 0;

  return (
    <Card as="section">
      <SectionHeader>
        <Icon name={icon} className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>{title}</h2>
        <Badge>{items.length}</Badge>
      </SectionHeader>
      {hasNoItems ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <List>
          {items.map((i) => <ItemRow key={i.id} item={i} showState={false} />)}
        </List>
      )}
      {moreHref && <Link href={moreHref} className="mt-4 inline-flex items-center gap-1 text-meta font-semibold text-accent hover:underline">{moreLabel} <Icon name="arrow-right-line" /></Link>}
    </Card>
  );
}
