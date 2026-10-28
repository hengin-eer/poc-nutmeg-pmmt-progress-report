import { Link } from "@void/react";
import type { Props } from "../../pages/index.server";
import { formatJst, remainingLabel } from "../../lib/domain";
import { Card, Icon } from "../ui";

export function Hero({ cycle, cards, unitId, now }: { cycle: NonNullable<Props["cycle"]>; cards: Props["cards"]; unitId: number | null; now: string }) {
  const done = cards.filter((c) => c.submitted).length;
  const myCard = cards.find((c) => c.id === unitId);
  const isOpen = cycle.status === "open";
  const over = new Date(cycle.deadlineAt) <= new Date(now);

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
          <span style={{ width: `${(done / Math.max(cards.length, 1)) * 100}%` }} />
        </div>
        <div className="hero-deadline">
          <Icon name="alarm-line" />
          締切 <strong>{formatJst(cycle.deadlineAt)}</strong>
          {isOpen && <span className={`remaining ${over ? "over" : ""}`}>{remainingLabel(cycle.deadlineAt, new Date(now))}</span>}
          {!isOpen && <span className="muted">この回は終了しました</span>}
        </div>
      </div>
      {myCard && isOpen && (
        <Link href="/report" className={`button big ${myCard.submitted ? "" : "primary"}`}>
          <Icon name="edit-box-line" />
          {myCard.submitted ? "記入を直す" : "事前記入する"}
        </Link>
      )}
    </Card>
  );
}
