import { Link } from "@void/react";
import { formatJst, remainingLabel } from "../../lib/domain";
import type { Props } from "../../pages/index.server";
import { Card, Icon } from "../ui";

type HeroProps = { cycle: NonNullable<Props["cycle"]>; cards: Props["cards"]; unitId: number | null; now: string };

export function Hero({ cycle, cards, unitId, now }: HeroProps) {
  const done = cards.filter((c) => c.submitted).length;
  const myCard = cards.find((c) => c.id === unitId);
  const isOpen = cycle.status === "open";
  const over = new Date(cycle.deadlineAt) <= new Date(now);
  const remainingClass = over ? "over" : "";
  const isCycleClosed = !isOpen;
  const canEditReport = Boolean(myCard) && isOpen;
  const reportActionVariant = myCard?.submitted ? "" : "primary";
  const reportActionLabel = myCard?.submitted ? "記入を直す" : "事前記入する";
  const progressBarWidth = `${(done / Math.max(cards.length, 1)) * 100}%`;

  return (
    <Card as="section" className="card hero">
      <div>
        <div className="hero-label">
          <Icon name="calendar-event-line" />
          {formatJst(cycle.meetingAt)} の PMMT
        </div>
        <div className="hero-num">
          {done}
          <small>/ {cards.length} 提出</small>
        </div>
        <div className="progress-bar" aria-label={`提出 ${done} / ${cards.length}`}>
          <span style={{ width: progressBarWidth }} />
        </div>
        <div className="hero-deadline">
          <Icon name="alarm-line" />
          締切 <strong>{formatJst(cycle.deadlineAt)}</strong>
          {isOpen && <span className={`remaining ${remainingClass}`}>{remainingLabel(cycle.deadlineAt, new Date(now))}</span>}
          {isCycleClosed && <span className="muted">この回は終了しました</span>}
        </div>
      </div>
      {canEditReport && (
        <Link href="/report" className={`button big ${reportActionVariant}`}>
          <Icon name="edit-box-line" />
          {reportActionLabel}
        </Link>
      )}
    </Card>
  );
}
