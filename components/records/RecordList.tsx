import { Card, EmptyState, List } from "../ui";
import { type Props } from "../../pages/records/index.server";
import { RecordRow } from "./RecordRow";

export function RecordList({ me, list }: Pick<Props, "me" | "list">) {
  return (
    <Card className="mt-10">
      {list.length === 0 ? (
        <EmptyState>見つかりませんでした</EmptyState>
      ) : (
        <List>
          {list.map((record) => <RecordRow key={record.id} record={record} me={me} />)}
        </List>
      )}
    </Card>
  );
}
