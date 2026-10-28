import { flowStyles } from "../ui/Flow";
import { headingStyles, textStyles, tv } from "../ui/styles";
import { ITEM_STATE_LABEL, formatJst } from "../../lib/domain";
import { CrossBureau, KindIcon, STATE_ICON, StatePill } from "../domain";
import { Avatar, Badge, Button, EmptyState, Icon, Link, Row } from "../ui";
import { ClosePanel } from "./ClosePanel";
import { CommentForm } from "./CommentForm";
import { post } from "./request";
import type { ThreadData } from "../../lib/items";

const resolution = tv({
  base: "flex gap-2 rounded-xl bg-surface-2 px-4 py-3 text-meta [&>i]:mt-1 [&>i]:text-lg",
  variants: { state: {
    open: "", resolved: "",
    decided: "bg-green-soft [&>i]:text-green [&_strong]:text-green",
    deferred: "bg-red-soft [&>i]:text-red [&_strong]:text-red",
    live: "bg-purple-soft [&>i]:text-purple [&_strong]:text-purple",
  } },
});
const reaction = tv({
  base: "gap-1 rounded-full border border-border bg-surface px-3 py-1 text-meta font-semibold hover:bg-surface-2",
  variants: {
    zero: { true: "opacity-55 hover:opacity-100" },
    mine: { true: "border-accent bg-accent-soft text-accent opacity-100 hover:bg-accent-soft" },
  },
});

export function ThreadView({ data, onChange }: { data: ThreadData; onChange: (d: ThreadData) => void }) {
  const { item, unit, cycle, thread, reactionSummary } = data;

  const run = async (payload: Record<string, unknown>) => {
    const res = await post(item.id, payload);
    if (res.ok) onChange(res.data);
    return res;
  };

  return (
    <article data-slot="thread" className="flex flex-col gap-6">
      <header className={flowStyles({ direction: "column", gap: 2 })}>
        <Row>
          <KindIcon kind={item.kind} />
          <Link href={`/units/${unit.id}`} className="text-body font-extrabold text-text">
            {unit.name}
          </Link>
          <StatePill state={item.state} />
          <CrossBureau on={item.crossBureau} />
        </Row>
        <div className={textStyles({ role: "meta" })}>
          {data.authorName} ・ {formatJst(item.createdAt)}
          <span className="max-md:hidden"> ・ {formatJst(cycle.meetingAt)} の PMMT</span>
        </div>
      </header>

      <p className="m-0 whitespace-pre-wrap text-subheading leading-[1.75] font-medium">{item.body}</p>

      {item.resolutionNote && (
        <div className={resolution({ state: item.state })}>
          <Icon name={STATE_ICON(item.state)} />
          <div>
            <strong>{ITEM_STATE_LABEL[item.state]}</strong>
            <div>{item.resolutionNote}</div>
            {data.closedByName && <div className={textStyles({ role: "meta" })}>{data.closedByName}</div>}
          </div>
        </div>
      )}

      <div className={flowStyles({ direction: "wrap", gap: 2 })}>
        {reactionSummary.map((r) => (
          <Button
            key={r.emoji}
            type="button"
            variant="plain" className={reaction({ mine: r.mine, zero: !r.count })}
            title={r.names.join("、") || "リアクションする"}
            onClick={() => run({ op: "react", emoji: r.emoji })}
          >
            {r.emoji}
            {r.count > 0 && <span>{r.count}</span>}
          </Button>
        ))}
      </div>

      {data.canClose && <ClosePanel key={item.state} nextStates={data.nextStates} run={run} />}

      <section className="border-t border-border pt-6 [&_h3]:mb-4">
        <h3 className={headingStyles({ level: "subheading" })}>
          コメント <Badge>{thread.length}</Badge>
        </h3>
        {thread.length === 0 ? (
          <EmptyState>まだコメントはありません</EmptyState>
        ) : (
          <ul className="mb-6 flex list-none flex-col gap-4 p-0 [&>li]:grid [&>li]:grid-cols-[32px_minmax(0,1fr)] [&>li]:gap-3">
            {thread.map((t) => (
              <li key={t.id}>
                <Avatar aria-hidden="true">
                  {t.author.slice(0, 1)}
                </Avatar>
                <div>
                  <Row className="mb-1 gap-2 text-meta">
                    <strong>{t.author}</strong>
                    <span className={textStyles({ role: "meta" })}>{formatJst(t.createdAt)}</span>
                  </Row>
                  <div className="whitespace-pre-wrap">{t.body}</div>
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
