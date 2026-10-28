import { Card, EmptyState, Icon, Notice } from "../ui";
import { type Props } from "../../pages/items/index.server";
import { ItemRow } from "./ItemRow";

type ItemsPanelProps = Pick<Props, "tab" | "list">;

export function ItemsPanel({ tab, list }: ItemsPanelProps) {
  return (
    <>
      {tab === "live" && (
        <Notice className="info" style={{ marginBottom: 20 }}>
          <Icon name="information-line" />
          当日の議題一覧です。話し終わったら「決定」か「先送り」で閉じてください
        </Notice>
      )}

      <Card className="card">
        {list.length === 0 ? (
          <EmptyState className="empty">ここに表示するものはありません</EmptyState>
        ) : (
          <ul className="list">
            {list.map((i) => (
              <ItemRow key={i.id} item={i} showState={tab === "all" || tab === "closed"} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
