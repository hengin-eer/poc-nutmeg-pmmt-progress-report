import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/units/[id].server";
import { RecordPill } from "../domain";
import { Badge, Card, EmptyState, SectionHeader } from "../ui";

type UnitRecord = Props["records"][number];

type UnitRecordsProps = Pick<Props, "records">;

export function UnitRecords({ records }: UnitRecordsProps) {
  const hasNoRecords = records.length === 0;

  function getRecordCompletionClass(r: UnitRecord) {
    return r.doneAt && r.kind !== "decision" ? "done" : "";
  }

  return (
    <section>
      <SectionHeader className="section-head">
        <h2>このユニットの記録</h2>
        <Badge className="count">{records.length}</Badge>
      </SectionHeader>
      <Card className="card">
        {hasNoRecords ? (
          <EmptyState className="empty">まだ記録はありません</EmptyState>
        ) : (
          <ul className="list">
            {records.map((r) => (
              <li key={r.id}>
                <div className={`record-title ${getRecordCompletionClass(r)}`} style={{ fontSize: 15 }}>
                  {r.title}
                </div>
                <div className="record-meta" style={{ marginTop: 6 }}>
                  <RecordPill kind={r.kind} />
                  <span className="meta">{formatJstDate(r.meetingAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
