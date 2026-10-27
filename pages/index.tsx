import { Link } from "@void/react";
import { ItemRow } from "../components/thread";
import { Busy, Icon, ProgressPill, RecordPill, UNIT_KIND_SHORT } from "../components/ui";
import { formatJst, remainingLabel } from "../lib/domain";
import type { Props } from "./index.server";

export default function Dashboard({ me, cycle, cards, liveItems, openItems, pending, now }: Props) {
  if (!cycle) {
    return (
      <div className="card card-lg narrow">
        <h1>まだ回がありません</h1>
        <p className="lead">{me.isAdmin ? <Link href="/admin">管理画面</Link> : "局長・副局長が管理画面"}から PMMT の回を作ってください。</p>
      </div>
    );
  }

  const done = cards.filter((c) => c.submitted).length;
  const myCard = cards.find((c) => c.id === me.unitId);
  const isOpen = cycle.status === "open";
  const over = new Date(cycle.deadlineAt) <= new Date(now);

  return (
    <>
      <section className="card hero">
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
      </section>

      <section className="section">
        <div className="section-head">
          <h2>各ユニット</h2>
        </div>
        <div className="grid grid-cards">
          {cards.map((c) => (
            <Link key={c.id} href={`/units/${c.id}`} className={`card card-link unit-card ${c.submitted ? "" : "missing"}`}>
              <div className="row" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="name">{c.name}</div>
                  <div className="kind">{UNIT_KIND_SHORT[c.kind]}</div>
                </div>
                {c.submitted ? <ProgressPill value={c.progress} /> : <span className="pill">未記入</span>}
              </div>
              {c.submitted && <div className="excerpt">{c.excerpt}</div>}
              <div className="foot">
                {c.submitted && <Busy value={c.busyness} label />}
                <span className="spacer" />
                {c.openCount > 0 && (
                  <span className="pill yellow" title={`未解決の確認事項 ${c.openCount} 件`}>
                    <Icon name="question-answer-line" />
                    {c.openCount}
                  </span>
                )}
                {c.crossCount > 0 && (
                  <span className="pill accent" title={`他局・実行委員に関わる ${c.crossCount} 件`}>
                    <Icon name="community-line" />
                    {c.crossCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-2 section">
        <section className="card">
          <div className="section-head">
            <Icon name="mic-line" className="muted" />
            <h2>当日に話すこと</h2>
            <span className="count">{liveItems.length}</span>
          </div>
          {liveItems.length === 0 ? (
            <p className="empty">今のところ、当日の議題はありません</p>
          ) : (
            <ul className="list">
              {liveItems.map((i) => (
                <ItemRow key={i.id} item={i} showState={false} />
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="section-head">
            <Icon name="question-answer-line" className="muted" />
            <h2>未解決の確認事項</h2>
            <span className="count">{openItems.length}</span>
          </div>
          {openItems.length === 0 ? (
            <p className="empty">未解決の確認事項はありません</p>
          ) : (
            <ul className="list">
              {openItems.map((i) => (
                <ItemRow key={i.id} item={i} showState={false} />
              ))}
            </ul>
          )}
          <Link href="/items" className="more">
            すべての確認事項 <Icon name="arrow-right-line" />
          </Link>
        </section>
      </div>

      <section className="card section">
        <div className="section-head">
          <Icon name="arrow-go-forward-line" className="muted" />
          <h2>持ち越し中</h2>
          <span className="count">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <p className="empty">持ち越しているものはありません</p>
        ) : (
          <ul className="list">
            {pending.map((p) => (
              <li key={p.id} className="row" style={{ gap: 12 }}>
                <RecordPill kind={p.kind} />
                <span style={{ flex: 1, minWidth: 0 }}>{p.title}</span>
                {p.unitName && <span className="meta">{p.unitName}</span>}
              </li>
            ))}
          </ul>
        )}
        <Link href="/records?status=pending" className="more">
          記録を見る <Icon name="arrow-right-line" />
        </Link>
      </section>
    </>
  );
}
