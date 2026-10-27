import { Link } from "@void/react";
import { ItemRow } from "../../components/thread";
import { Icon } from "../../components/ui";
import { formatJst } from "../../lib/domain";
import type { Props, Tab } from "./index.server";

const TABS: Record<Tab, { label: string; icon: string }> = {
  open: { label: "未解決", icon: "time-line" },
  live: { label: "当日に話す", icon: "mic-line" },
  closed: { label: "閉じたもの", icon: "check-double-line" },
  all: { label: "すべて", icon: "list-check" },
};

export default function ItemsPage({ tab, cycle, list, counts }: Props) {
  return (
    <div className="narrow" style={{ maxWidth: 960 }}>
      <div className="page-head">
        <div>
          {cycle && <div className="eyebrow">{formatJst(cycle.meetingAt)} の PMMT</div>}
          <h1>確認事項</h1>
        </div>
      </div>

      <nav className="tabs">
        {(Object.keys(TABS) as Tab[]).map((t) => (
          <Link key={t} href={`/items?tab=${t}`} className={t === tab ? "active" : ""} preserveScroll>
            <Icon name={TABS[t].icon} />
            {TABS[t].label}
            <span className="count">{counts[t]}</span>
          </Link>
        ))}
      </nav>

      {tab === "live" && (
        <p className="info" style={{ marginBottom: 20 }}>
          <Icon name="information-line" />
          当日の議題一覧です。話し終わったら「決定」か「先送り」で閉じてください
        </p>
      )}

      <div className="card">
        {list.length === 0 ? (
          <p className="empty">ここに表示するものはありません</p>
        ) : (
          <ul className="list">
            {list.map((i) => (
              <ItemRow key={i.id} item={i} showState={tab === "all" || tab === "closed"} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
