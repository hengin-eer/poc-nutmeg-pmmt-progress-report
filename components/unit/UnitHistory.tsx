import { Markdown } from "../markdown";
import { ItemRow } from "../thread";
import { Card, EmptyState, SectionHeader } from "../ui";
import { Busy, ProgressPill } from "../domain";
import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/units/[id].server";

type UnitHistoryProps = Pick<Props, "history">;

export function UnitHistory({ history }: UnitHistoryProps) {
  return (
    <section>
      <SectionHeader className="section-head">
        <h2>週ごとの更新</h2>
      </SectionHeader>
      {history.length === 0 && <EmptyState className="empty">まだ提出された記入はありません</EmptyState>}
      <div className="stack" style={{ gap: 20 }}>
        {history.map((h) => (
          <Card as="article" key={h.cycleId} className="card">
            <div className="row" style={{ marginBottom: 14 }}>
              <strong>{formatJstDate(h.meetingAt)}</strong>
              <span className="spacer" />
              <ProgressPill value={h.progress} />
              <Busy value={h.busyness} label />
            </div>
            {h.done && (
              <div className="report-block">
                <h3>やったこと</h3>
                <Markdown>{h.done}</Markdown>
              </div>
            )}
            {h.next && (
              <div className="report-block">
                <h3>次にやること</h3>
                <Markdown>{h.next}</Markdown>
              </div>
            )}
            {h.items.length > 0 && (
              <ul className="list" style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                {h.items.map((i) => (
                  <ItemRow key={i.id} item={i} />
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
