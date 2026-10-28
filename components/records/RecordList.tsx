import { Card, EmptyState } from "../ui";
import { type Props } from "../../pages/records/index.server";
import { RecordRow } from "./RecordRow";

type RecordListProps = Pick<Props, "me" | "list">;

export function RecordList({ me, list }: RecordListProps) {
  const hasNoItems = list.length === 0;

  return (
    <Card className="card section">
      {hasNoItems ? (
        <EmptyState className="empty">見つかりませんでした</EmptyState>
      ) : (
        <ul className="list">
          {list.map((record) => <RecordRow key={record.id} record={record} me={me} />)}
        </ul>
      )}
    </Card>
  );
}
