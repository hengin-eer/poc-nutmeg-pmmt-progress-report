import { Card, EmptyState, Icon, List, Notice } from "../ui";
import { type Props } from "../../pages/items/index.server";
import { ItemRow } from "./ItemRow";

export function ItemsPanel({ tab, list }: Pick<Props, "tab" | "list">) {
  return (
    <>
      {tab === "live" && (
        <Notice tone="info" className="mb-4">
          <Icon name="information-line" />
          当日の議題一覧です。話し終わったら「決定」か「先送り」で閉じてください
        </Notice>
      )}

      <Card>
        {list.length === 0 ? (
          <EmptyState>ここに表示するものはありません</EmptyState>
        ) : (
          <List>
            {list.map((i) => (
              <ItemRow key={i.id} item={i} showState={tab === "all" || tab === "closed"} />
            ))}
          </List>
        )}
      </Card>
    </>
  );
}
