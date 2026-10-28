import { action } from "@void/react";
import type { ChangeEvent } from "react";
import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/records/index.server";
import { RecordPill, SourceBadge } from "../domain";
import { useThread } from "../thread";
import { Button, Icon } from "../ui";

type RecordRowProps = { record: Props["list"][number]; me: Props["me"] };

export function RecordRow({ record: r, me }: RecordRowProps) {
  const { open } = useThread();
  const toggleable = r.kind !== "decision" && (me.isAdmin || r.unitId === me.unitId);
  const done = Boolean(r.doneAt) && r.kind !== "decision";
  const isActionableRecord = r.kind !== "decision";
  const isRecordReadOnly = !toggleable;
  const recordCompletionClass = done ? "done" : "";
  const hasRecordDetails = Boolean(r.body);
  const hasUnitName = Boolean(r.unitName);
  const hasSourceThread = Boolean(r.source === "thread" && r.sourceItemId);

  function handleToggle(e: ChangeEvent<HTMLInputElement>) {
    action("/records?toggle", { data: { id: r.id, done: e.target.checked } });
  }

  function handleOpenThread() {
    open(r.sourceItemId!);
  }

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
