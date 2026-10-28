import type { ChangeEvent } from "react";
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
  function handleToggle(e: ChangeEvent<HTMLInputElement>) {
    return action("/records?toggle", { data: { id: r.id, done: e.target.checked } });
  }

  function handleOpenThread() { return open(r.sourceItemId!); }

  const isActionableRecord = r.kind !== "decision";
  const isRecordReadOnly = !toggleable;
  const recordCompletionClass = done ? "done" : "";
  const hasRecordDetails = r.body;
  const hasUnitName = r.unitName;
  const hasSourceThread = r.source === "thread" && r.sourceItemId;

  return (
    <li className="record">
      <div className="record-check">
        {isActionableRecord && (
          <input
            type="checkbox"
            checked={Boolean(r.doneAt)}
            disabled={isRecordReadOnly}
            aria-label="終わった"
            onChange={handleToggle}
          />
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className={`record-title ${recordCompletionClass}`}>{r.title}</div>
        {hasRecordDetails && <div className="record-body">{r.body}</div>}
        <div className="record-meta">
          <RecordPill kind={r.kind} />
          {hasUnitName && <span className="record-unit">{r.unitName}</span>}
          <span className="meta">{formatJstDate(r.meetingAt)}</span>
          <span className="spacer" />
          {hasSourceThread ? (
            <Button type="button" className="source source-thread" onClick={handleOpenThread} title="元のスレッドを開く">
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
