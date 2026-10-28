import { Card, EmptyState, Icon, Notice } from "../ui";
import { type Props } from "../../pages/items/index.server";
import { ItemRow } from "./ItemRow";

type ItemsPanelProps = Pick<Props, "tab" | "list">;

export function ItemsPanel({ tab, list }: ItemsPanelProps) {
  const isLiveTab = tab === "live";
  const hasNoItems = list.length === 0;
  const showItemState = tab === "all" || tab === "closed";

  return (
    <>
      {isLiveTab && (
        <Notice className="info" style={{ marginBottom: 20 }}>
          <Icon name="information-line" />
          当日の議題一覧です。話し終わったら「決定」か「先送り」で閉じてください
        </Notice>
      )}

      <Card className="card">
        {hasNoItems ? (
          <EmptyState className="empty">ここに表示するものはありません</EmptyState>
        ) : (
          <ul className="list">
            {list.map((i) => (
              <ItemRow key={i.id} item={i} showState={showItemState} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
