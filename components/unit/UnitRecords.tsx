import { headingStyles, textStyles } from "../ui/styles";
import { Badge, Card, EmptyState, List, SectionHeader } from "../ui";
import { RecordPill, recordTitle } from "../domain";
import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/units/[id].server";

export function UnitRecords({ records }: Pick<Props, "records">) {
  return (
    <section>
      <SectionHeader>
        <h2 className={headingStyles({ level: "heading" })}>このユニットの記録</h2>
        <Badge>{records.length}</Badge>
      </SectionHeader>
      <Card>
        {records.length === 0 ? (
          <EmptyState>まだ記録はありません</EmptyState>
        ) : (
          <List>
            {records.map((r) => (
              <li key={r.id}>
                <div className={recordTitle({ done: Boolean(r.doneAt) && r.kind !== "decision" })}>
                  {r.title}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <RecordPill kind={r.kind} />
                  <span className={textStyles({ role: "meta" })}>{formatJstDate(r.meetingAt)}</span>
                </div>
              </li>
            ))}
          </List>
        )}
      </Card>
    </section>
  );
}
