import { Link } from "@void/react";
import { ItemRow, type ItemSummary } from "../thread";
import { Badge, Card, EmptyState, Icon, SectionHeader } from "../ui";

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
    <Card as="section" className="card">
      <SectionHeader className="section-head">
        <Icon name={icon} className="muted" />
        <h2>{title}</h2>
        <Badge className="count">{items.length}</Badge>
      </SectionHeader>
      {hasNoItems ? (
        <EmptyState className="empty">{empty}</EmptyState>
      ) : (
        <ul className="list">
          {items.map((i) => <ItemRow key={i.id} item={i} showState={false} />)}
        </ul>
      )}
      {moreHref && <Link href={moreHref} className="more">{moreLabel} <Icon name="arrow-right-line" /></Link>}
    </Card>
  );
}
