import { Link } from "@void/react";
import type { Props } from "../../pages/index.server";
import { Busy, ProgressPill, UNIT_KIND_SHORT } from "../domain";
import { Markdown } from "../markdown";
import { Card, Icon, Pill } from "../ui";

type UnitCardProps = { card: Props["cards"][number] };

export function UnitCard({ card }: UnitCardProps) {
  const submissionClass = card.submitted ? "" : "missing";
  const hasSubmittedReport = card.submitted;
  const hasOpenItems = card.openCount > 0;
  const hasCrossBureauItems = card.crossCount > 0;

  return (
    <Card as="article" className={`card unit-card ${submissionClass}`}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/units/${card.id}`} className="name">{card.name}</Link>
          <div className="kind">{UNIT_KIND_SHORT[card.kind]}</div>
        </div>
        {hasSubmittedReport ? <ProgressPill value={card.progress} /> : <Pill className="pill">未記入</Pill>}
      </div>
      {hasSubmittedReport && <Markdown className="excerpt">{card.excerpt}</Markdown>}
      <div className="foot">
        {hasSubmittedReport && <Busy value={card.busyness} label />}
        <span className="spacer" />
        {hasOpenItems && (
          <Pill className="pill yellow" title={`未解決の確認事項 ${card.openCount} 件`}>
            <Icon name="question-answer-line" />
            {card.openCount}
          </Pill>
        )}
        {hasCrossBureauItems && (
          <Pill className="pill accent" title={`他局・実行委員に関わる ${card.crossCount} 件`}>
            <Icon name="community-line" />
            {card.crossCount}
          </Pill>
        )}
      </div>
    </Card>
  );
}
