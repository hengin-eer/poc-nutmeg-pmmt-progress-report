import { Link } from "@void/react";
import { formatJst, ITEM_STATE_LABEL } from "../../lib/domain";
import type { ThreadData } from "../../lib/items";
import { CrossBureau, KindIcon, STATE_ICON, StatePill } from "../domain";
import { Badge, Button, EmptyState, Icon } from "../ui";
import { ClosePanel } from "./ClosePanel";
import { CommentForm } from "./CommentForm";
import { post } from "./request";

type ThreadViewProps = { data: ThreadData; onChange: (d: ThreadData) => void };

export function ThreadView({ data, onChange }: ThreadViewProps) {
  const { item, unit, cycle, thread, reactionSummary } = data;

  const run = async (payload: Record<string, unknown>) => {
    const res = await post(item.id, payload);
    if (res.ok) onChange(res.data);
    return res;
  };

  function handleReaction(r: (typeof reactionSummary)[number]) { return run({ op: "react", emoji: r.emoji }); }

  const hasResolutionNote = item.resolutionNote;
  const hasClosingAuthor = data.closedByName;
  function getReactionSelectionClass(r: (typeof reactionSummary)[number]) { return r.mine ? "mine" : ""; }
  function getReactionCountClass(r: (typeof reactionSummary)[number]) { return r.count ? "" : "zero"; }
  function getReactionTitle(r: (typeof reactionSummary)[number]) { return r.names.join("、") || "リアクションする"; }
  function hasReactionCount(r: (typeof reactionSummary)[number]) { return r.count > 0; }
  const canChangeItemState = data.canClose;
  const hasNoComments = thread.length === 0;

  return (
    <article className="thread">
      <header className="thread-head">
        <div className="row">
          <KindIcon kind={item.kind} />
          <Link href={`/units/${unit.id}`} className="thread-unit">
            {unit.name}
          </Link>
          <StatePill state={item.state} />
          <CrossBureau on={item.crossBureau} />
        </div>
        <div className="meta">
          {data.authorName} ・ {formatJst(item.createdAt)}
          <span className="hide-sm"> ・ {formatJst(cycle.meetingAt)} の PMMT</span>
        </div>
      </header>

      <p className="thread-body">{item.body}</p>

      {hasResolutionNote && (
        <div className={`resolution state-${item.state}`}>
          <Icon name={STATE_ICON(item.state)} />
          <div>
            <strong>{ITEM_STATE_LABEL[item.state]}</strong>
            <div>{item.resolutionNote}</div>
            {hasClosingAuthor && <div className="meta">{data.closedByName}</div>}
          </div>
        </div>
      )}

      <div className="reactions">
        {reactionSummary.map((r) => (
          <Button
            key={r.emoji}
            type="button"
            className={`reaction ${getReactionSelectionClass(r)} ${getReactionCountClass(r)}`}
            title={getReactionTitle(r)}
            onClick={() => handleReaction(r)}
          >
            {r.emoji}
            {hasReactionCount(r) && <span>{r.count}</span>}
          </Button>
        ))}
      </div>

      {canChangeItemState && <ClosePanel key={item.state} nextStates={data.nextStates} run={run} />}

      <section className="comments">
        <h3>
          コメント <Badge className="count">{thread.length}</Badge>
        </h3>
        {hasNoComments ? (
          <EmptyState className="empty">まだコメントはありません</EmptyState>
        ) : (
          <ul className="comment-list">
            {thread.map((t) => (
              <li key={t.id}>
                <div className="avatar" aria-hidden="true">
                  {t.author.slice(0, 1)}
                </div>
                <div>
                  <div className="row comment-head">
                    <strong>{t.author}</strong>
                    <span className="meta">{formatJst(t.createdAt)}</span>
                  </div>
                  <div className="body">{t.body}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <CommentForm run={run} />
      </section>
    </article>
  );
}
