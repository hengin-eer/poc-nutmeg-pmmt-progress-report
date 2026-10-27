import { Link } from "@void/react";
import { Busy, CrossBureau, KindLabel, ProgressPill, RecordPill, StatePill, UNIT_KIND_LABEL } from "../components/ui";
import { formatJst, remainingLabel } from "../lib/domain";
import type { Props } from "./index.server";

export default function Dashboard({ me, cycle, cards, liveItems, openItems, pending, now }: Props) {
  if (!cycle) {
    return (
      <div className="card">
        <h1>まだ回がありません</h1>
        <p>{me.isAdmin ? <Link href="/admin">管理画面</Link> : "局長・副局長が管理画面"}から PMMT の回を作成してください。</p>
      </div>
    );
  }

  const done = cards.filter((c) => c.submitted).length;
  const myCard = cards.find((c) => c.id === me.unitId);
  const isOpen = cycle.status === "open";

  return (
    <>
      <section className="card hero">
        <div>
          <div className="sub">次の PMMT：{formatJst(cycle.meetingAt)}</div>
          <div className="big">
            事前記入 {done} / {cards.length}
          </div>
          <div className="progress-bar" aria-label={`記入済み ${done} / ${cards.length}`}>
            <span style={{ width: `${(done / Math.max(cards.length, 1)) * 100}%` }} />
          </div>
          <div className="sub" style={{ marginTop: 6 }}>
            締切 {formatJst(cycle.deadlineAt)}（{isOpen ? remainingLabel(cycle.deadlineAt, new Date(now)) : "この回は終了しました"}）
          </div>
        </div>
        {myCard && isOpen && (
          <Link href="/report" className={`button ${myCard.submitted ? "" : "primary"}`}>
            {myCard.submitted ? "自分の記入を直す" : "事前記入する →"}
          </Link>
        )}
      </section>

      <section className="section">
        <div className="row" style={{ marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>みんなの状態</h2>
          <span className="sub">カードを押すと詳細</span>
        </div>
        <div className="grid grid-cards">
          {cards.map((c) => (
            <Link key={c.id} href={`/units/${c.id}`} className={`card card-link unit-card ${c.submitted ? "" : "missing"}`}>
              <div className="name">
                {c.name}
                <span className="spacer" />
                {c.submitted ? <ProgressPill value={c.progress} /> : <span className="pill">未記入</span>}
              </div>
              <div className="kind">{UNIT_KIND_LABEL[c.kind]}</div>
              {c.submitted && <Busy value={c.busyness} />}
              {c.submitted && <div className="excerpt">{c.excerpt}</div>}
              <div className="row" style={{ marginTop: "auto" }}>
                {c.openCount > 0 && <span className="pill yellow">未解決 {c.openCount}</span>}
                {c.crossCount > 0 && <span className="pill accent">他局関連 {c.crossCount}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-2 section">
        <section className="card">
          <h2>
            未解決の確認事項 <span className="pill yellow">{openItems.length}</span>
          </h2>
          <ItemList list={openItems} empty="未解決の確認事項はありません 🎉" />
          <Link href="/items">すべての確認事項 →</Link>
        </section>

        <section className="card">
          <h2>
            当日に話すこと <span className="pill purple">{liveItems.length}</span>
          </h2>
          <ItemList list={liveItems} empty="今のところ、当日に話す議題はありません" />
          <p className="hint">PMMT の議題一覧として使います</p>
        </section>
      </div>

      <section className="card section">
        <h2>
          持ち越し中の TODO・議題 <span className="pill">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <p className="empty">持ち越しているものはありません</p>
        ) : (
          <ul className="list">
            {pending.map((p) => (
              <li key={p.id} className="row">
                <RecordPill kind={p.kind} />
                <span>{p.title}</span>
                {p.unitName && <span className="meta">{p.unitName}</span>}
              </li>
            ))}
          </ul>
        )}
        <Link href="/records?status=pending">記録を見る →</Link>
      </section>
    </>
  );
}

function ItemList({ list, empty }: { list: Props["openItems"]; empty: string }) {
  if (!list.length) return <p className="empty">{empty}</p>;
  return (
    <ul className="list" style={{ marginBottom: 12 }}>
      {list.map((i) => (
        <li key={i.id}>
          <Link href={`/items/${i.id}`} style={{ color: "inherit" }}>
            <div className="row" style={{ marginBottom: 4 }}>
              <strong>{i.unitName}</strong>
              <KindLabel kind={i.kind} />
              <StatePill state={i.state} />
              <CrossBureau on={i.crossBureau} />
            </div>
            <div className="body">{i.body}</div>
            <div className="meta">
              コメント {i.comments}・リアクション {i.reactions}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
