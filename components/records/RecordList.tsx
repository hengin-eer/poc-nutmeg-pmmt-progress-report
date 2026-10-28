import { Card, EmptyState } from "../ui";
import { type Props } from "../../pages/records/index.server";
import { RecordRow } from "./RecordRow";

export function RecordList({ me, list }: Pick<Props, "me" | "list">) {
  return (
    <Card className="card section">
      {list.length === 0 ? (
        <EmptyState className="empty">見つかりませんでした</EmptyState>
      ) : (
        <ul className="list">
          {list.map((record) => <RecordRow key={record.id} record={record} me={me} />)}
        </ul>
      )}
    </Card>
  );
}
