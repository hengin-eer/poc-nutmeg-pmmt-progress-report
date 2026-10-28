import { type Props } from "../../pages/records/index.server";
import { Card, EmptyState, List } from "../ui";
import { RecordRow } from "./RecordRow";

type RecordListProps = Pick<Props, "me" | "list">;

export function RecordList({ me, list }: RecordListProps) {
  const hasNoItems = list.length === 0;

  return (
    <Card className="mt-10">
      {hasNoItems ? (
        <EmptyState>見つかりませんでした</EmptyState>
      ) : (
        <List>
          {list.map((record) => <RecordRow key={record.id} record={record} me={me} />)}
        </List>
      )}
    </Card>
  );
}
