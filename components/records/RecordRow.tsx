import { textStyles } from "../ui/styles";
import { action } from "@void/react";
import { useThread } from "../thread";
import { Button, Checkbox, Icon, badgeStyles } from "../ui";
import { RecordPill, SourceBadge, recordTitle } from "../domain";
import { formatJstDate } from "../../lib/domain";
import { type Props } from "../../pages/records/index.server";

export function RecordRow({ record: r, me }: { record: Props["list"][number]; me: Props["me"] }) {
  const { open } = useThread();
  const toggleable = r.kind !== "decision" && (me.isAdmin || r.unitId === me.unitId);
  const done = Boolean(r.doneAt) && r.kind !== "decision";
  return (
    <li data-slot="record" className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
      <div className="pt-1">
        {r.kind !== "decision" && (
          <Checkbox

            checked={Boolean(r.doneAt)}
            disabled={!toggleable}
            aria-label="終わった"
            onChange={(e) => action("/records?toggle", { data: { id: r.id, done: e.target.checked } })}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className={recordTitle({ done })}>{r.title}</div>
        {r.body && <div className="mt-1 whitespace-pre-wrap text-meta text-text-2">{r.body}</div>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RecordPill kind={r.kind} />
          {r.unitName && <span className="text-caption font-bold text-text-2">{r.unitName}</span>}
          <span className={textStyles({ role: "meta" })}>{formatJstDate(r.meetingAt)}</span>
          <span className="flex-1" />
          {r.source === "thread" && r.sourceItemId ? (
            <Button type="button" variant="plain" className={badgeStyles({ source: "thread" })} onClick={() => open(r.sourceItemId!)} title="元のスレッドを開く">
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
