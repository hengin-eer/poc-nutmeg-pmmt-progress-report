import { type Props } from "../../pages/index.server";
import { Busy, ProgressPill, UNIT_KIND_SHORT } from "../domain";
import { Markdown } from "../markdown";
import { Card, Icon, Link, Pill, Row } from "../ui";
import { tv } from "../ui/styles";

type UnitCardProps = { card: Props["cards"][number] };

const unitCard = tv({
  slots: {
    root: "group relative flex min-h-40 flex-col gap-2 p-6 transition-[border-color,translate] hover:-translate-y-px hover:border-accent/50",
    title: "text-subheading leading-snug font-extrabold text-text after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-accent focus-visible:after:outline-offset-2",
    excerpt: "line-clamp-3 max-h-[4.95em] text-meta leading-[1.65] text-text-2",
    foot: "mt-auto flex flex-wrap items-center gap-2 [&_[data-slot=pill]]:relative [&_[data-slot=pill]]:z-10",
  },
  variants: { submitted: { false: { root: "border-dashed bg-transparent shadow-none", title: "text-muted" } } },
});

export function UnitCard({ card }: UnitCardProps) {
  const styles = unitCard({ submitted: card.submitted });
  const hasSubmittedReport = Boolean(card.submitted);
  const hasOpenItems = card.openCount > 0;
  const hasCrossBureauItems = card.crossCount > 0;

  return (
    <Card as="article" className={styles.root()}>
      <Row className="items-start">
        <div className="flex-1 min-w-0">
          <Link href={`/units/${card.id}`} className={styles.title()}>{card.name}</Link>
          <div className="text-caption font-semibold text-muted">{UNIT_KIND_SHORT[card.kind]}</div>
        </div>
        {hasSubmittedReport ? <ProgressPill value={card.progress} /> : <Pill>未記入</Pill>}
      </Row>
      {hasSubmittedReport && <Markdown compact className={styles.excerpt()}>{card.excerpt}</Markdown>}
      <div className={styles.foot()}>
        {hasSubmittedReport && <Busy value={card.busyness} label />}
        <span className="flex-1" />
        {hasOpenItems && (
          <Pill tone="yellow" title={`未解決の確認事項 ${card.openCount} 件`}>
            <Icon name="question-answer-line" />
            {card.openCount}
          </Pill>
        )}
        {hasCrossBureauItems && (
          <Pill tone="accent" title={`他局・実行委員に関わる ${card.crossCount} 件`}>
            <Icon name="community-line" />
            {card.crossCount}
          </Pill>
        )}
      </div>
    </Card>
  );
}
