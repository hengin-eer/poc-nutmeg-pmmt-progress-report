import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/units/[id].server";
import { Busy, ProgressPill } from "../domain";
import { Markdown } from "../markdown";
import { ItemRow } from "../thread";
import { Card, EmptyState, List, Row, SectionHeader, Stack } from "../ui";
import { headingStyles } from "../ui/styles";

type UnitHistoryProps = Pick<Props, "history">;

type HistoryEntry = Props["history"][number];

export function UnitHistory({ history }: UnitHistoryProps) {
  const hasNoHistory = history.length === 0;

  function hasCompletedWork(h: HistoryEntry) {
    return Boolean(h.done);
  }

  function hasPlannedWork(h: HistoryEntry) {
    return Boolean(h.next);
  }

  function hasRelatedItems(h: HistoryEntry) {
    return h.items.length > 0;
  }

  return (
    <section>
      <SectionHeader>
        <h2 className={headingStyles({ level: "heading" })}>週ごとの更新</h2>
      </SectionHeader>
      {hasNoHistory && <EmptyState>まだ提出された記入はありません</EmptyState>}
      <Stack className="gap-4">
        {history.map((h) => (
          <Card as="article" key={h.cycleId}>
            <Row className="mb-3">
              <strong>{formatJstDate(h.meetingAt)}</strong>
              <span className="flex-1" />
              <ProgressPill value={h.progress} />
              <Busy value={h.busyness} label />
            </Row>
            {hasCompletedWork(h) && (
              <div className="[&+&]:mt-4 [&_h3]:mb-1 [&_h3]:text-caption [&_h3]:font-bold [&_h3]:tracking-wide [&_h3]:text-muted">
                <h3 className={headingStyles({ level: "subheading" })}>やったこと</h3>
                <Markdown>{h.done}</Markdown>
              </div>
            )}
            {hasPlannedWork(h) && (
              <div className="[&+&]:mt-4 [&_h3]:mb-1 [&_h3]:text-caption [&_h3]:font-bold [&_h3]:tracking-wide [&_h3]:text-muted">
                <h3 className={headingStyles({ level: "subheading" })}>次にやること</h3>
                <Markdown>{h.next}</Markdown>
              </div>
            )}
            {hasRelatedItems(h) && (
              <List className="mt-2 border-t border-border pt-2">
                {h.items.map((i) => (
                  <ItemRow key={i.id} item={i} />
                ))}
              </List>
            )}
          </Card>
        ))}
      </Stack>
    </section>
  );
}
