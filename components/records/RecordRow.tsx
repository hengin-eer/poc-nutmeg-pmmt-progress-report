import { action } from "@void/react";
import { type ChangeEvent } from "react";
import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/records/index.server";
import { RecordPill, SourceBadge, recordTitle } from "../domain";
import { useThread } from "../thread";
import { Button, Checkbox, Icon, badgeStyles } from "../ui";
import { textStyles } from "../ui/styles";

type RecordRowProps = { record: Props["list"][number]; me: Props["me"] };

export function RecordRow({ record: r, me }: RecordRowProps) {
  const { open } = useThread();
  const toggleable = r.kind !== "decision" && (me.isAdmin || r.unitId === me.unitId);
  const done = Boolean(r.doneAt) && r.kind !== "decision";
  const isActionableRecord = r.kind !== "decision";
  const isRecordReadOnly = !toggleable;
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
    <li data-slot="record" className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
      <div className="pt-1">
        {isActionableRecord && (
          <Checkbox

            checked={Boolean(r.doneAt)}
            disabled={isRecordReadOnly}
            aria-label="終わった"
            onChange={handleToggle}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className={recordTitle({ done })}>{r.title}</div>
        {hasRecordDetails && <div className="mt-1 whitespace-pre-wrap text-meta text-text-2">{r.body}</div>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RecordPill kind={r.kind} />
          {hasUnitName && <span className="text-caption font-bold text-text-2">{r.unitName}</span>}
          <span className={textStyles({ role: "meta" })}>{formatJstDate(r.meetingAt)}</span>
          <span className="flex-1" />
          {hasSourceThread ? (
            <Button type="button" variant="plain" className={badgeStyles({ source: "thread" })} onClick={handleOpenThread} title="元のスレッドを開く">
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
