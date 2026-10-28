import { action } from "@void/react";
import { useThread } from "../thread";
import { Button, Icon } from "../ui";
import { RecordPill, SourceBadge } from "../domain";
import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/records/index.server";

type RecordRowProps = { record: Props["list"][number]; me: Props["me"] };

export function RecordRow({ record: r, me }: RecordRowProps) {
  const { open } = useThread();
  const toggleable = r.kind !== "decision" && (me.isAdmin || r.unitId === me.unitId);
  const done = Boolean(r.doneAt) && r.kind !== "decision";
  return (
    <li className="record">
      <div className="record-check">
        {r.kind !== "decision" && (
          <input
            type="checkbox"
            checked={Boolean(r.doneAt)}
            disabled={!toggleable}
            aria-label="終わった"
            onChange={(e) => action("/records?toggle", { data: { id: r.id, done: e.target.checked } })}
          />
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className={`record-title ${done ? "done" : ""}`}>{r.title}</div>
        {r.body && <div className="record-body">{r.body}</div>}
        <div className="record-meta">
          <RecordPill kind={r.kind} />
          {r.unitName && <span className="record-unit">{r.unitName}</span>}
          <span className="meta">{formatJstDate(r.meetingAt)}</span>
          <span className="spacer" />
          {r.source === "thread" && r.sourceItemId ? (
            <Button type="button" className="source source-thread" onClick={() => open(r.sourceItemId!)} title="元のスレッドを開く">
              <Icon name="chat-3-line" />
              スレッド
            </Button>
          ) : (
            <SourceBadge source={r.source} />
          )}
        </div>
      </div>
    </li>
  );
}
