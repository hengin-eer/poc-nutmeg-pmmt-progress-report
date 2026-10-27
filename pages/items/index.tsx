import { Link } from "@void/react";
import { CrossBureau, KindLabel, StatePill } from "../../components/ui";
import { formatJst } from "../../lib/domain";
import type { Props, Tab } from "./index.server";

const TAB_LABEL: Record<Tab, string> = { open: "未解決", live: "当日に話す", closed: "閉じたもの", all: "すべて" };

export default function ItemsPage({ tab, cycle, list, counts }: Props) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>確認事項</h1>
          {cycle && <div className="sub">{formatJst(cycle.meetingAt)} の PMMT</div>}
        </div>
      </div>

      <nav className="tabs">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <Link key={t} href={`/items?tab=${t}`} className={t === tab ? "active" : ""} preserveScroll>
            {TAB_LABEL[t]} <span className="meta">{counts[t]}</span>
          </Link>
        ))}
      </nav>

      {tab === "live" && <p className="notice">PMMT 当日の議題一覧です。話し終わったら「決定」か「先送り」で閉じてください。</p>}

      <div className="card" style={{ marginTop: 12 }}>
        {list.length === 0 ? (
          <p className="empty">ここに表示するものはありません</p>
        ) : (
          <ul className="list">
            {list.map((i) => (
              <li key={i.id}>
                <Link href={`/items/${i.id}`} style={{ color: "inherit", display: "block" }}>
                  <div className="row" style={{ marginBottom: 4 }}>
                    <strong>{i.unitName}</strong>
                    <KindLabel kind={i.kind} />
                    <StatePill state={i.state} />
                    <CrossBureau on={i.crossBureau} />
                    <span className="spacer" />
                    <span className="meta">
                      コメント {i.comments}・リアクション {i.reactions}
                    </span>
                  </div>
                  <div className="body">{i.body}</div>
                  {i.resolutionNote && <div className="meta">→ {i.resolutionNote}</div>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
