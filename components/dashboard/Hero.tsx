import { formatJst, remainingLabel } from "../../lib/domain";
import { ButtonLink, Card, Icon } from "../ui";
import type { Props } from "../../pages/index.server";

export function Hero({ cycle, cards, unitId, now }: { cycle: NonNullable<Props["cycle"]>; cards: Props["cards"]; unitId: number | null; now: string }) {
  const done = cards.filter((c) => c.submitted).length;
  const myCard = cards.find((c) => c.id === unitId);
  const isOpen = cycle.status === "open";
  const over = new Date(cycle.deadlineAt) <= new Date(now);

  return (
    <Card as="section" className="grid grid-cols-[1fr_auto] items-center gap-6 px-8 py-6 max-sm:grid-cols-1 max-sm:p-6">
      <div>
        <div className="flex items-center gap-2 text-caption font-semibold text-muted">
          <Icon name="calendar-event-line" />
          {formatJst(cycle.meetingAt)} の PMMT
        </div>
        <div className="mt-2 mb-1 text-display font-extrabold tracking-[-.02em]">
          {done}
          <small className="ml-1 text-heading font-bold text-muted">/ {cards.length} 提出</small>
        </div>
        <div className="mt-4 mb-3 h-2 max-w-[520px] overflow-hidden rounded-full bg-surface-2 [&>span]:block [&>span]:h-full [&>span]:rounded-full [&>span]:bg-accent" aria-label={`提出 ${done} / ${cards.length}`}>
          <span style={{ width: `${(done / Math.max(cards.length, 1)) * 100}%` }} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-meta text-text-2 [&_strong]:text-text">
          <Icon name="alarm-line" />
          締切 <strong>{formatJst(cycle.deadlineAt)}</strong>
          {isOpen && <span data-slot="remaining" className={over ? "font-bold text-red" : "font-bold text-accent"}>{remainingLabel(cycle.deadlineAt, new Date(now))}</span>}
          {!isOpen && <span className="text-muted">この回は終了しました</span>}
        </div>
      </div>
      {myCard && isOpen && (
        <ButtonLink href="/report" size="big" variant={myCard.submitted ? "default" : "primary"}>
          <Icon name="edit-box-line" />
          {myCard.submitted ? "記入を直す" : "事前記入する"}
        </ButtonLink>
      )}
    </Card>
  );
}
