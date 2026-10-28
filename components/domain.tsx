import { tv } from "./ui/styles";
import { Badge, Dot, Icon, Pill } from "./ui";
import { ITEM_STATE_LABEL, RECORD_KIND_LABEL, type ItemState, type RecordKind } from "../lib/domain";

export type Progress = "green" | "yellow" | "red" | null;
export type UnitKind = "project" | "team" | "chief" | "vice";

export const PROGRESS_LABEL: Record<"green" | "yellow" | "red", string> = {
  green: "順調",
  yellow: "注意",
  red: "困っている",
};

export const UNIT_KIND_LABEL: Record<UnitKind, string> = {
  project: "プロジェクト",
  team: "チーム",
  chief: "局長（実行委員の視点）",
  vice: "副局長（情報局の視点）",
};

/** カードなどに出す短い呼び方 */
export const UNIT_KIND_SHORT: Record<UnitKind, string> = { project: "PJ", team: "チーム", chief: "局長", vice: "副局長" };

export function ProgressPill({ value }: { value: Progress }) {
  if (!value) return null;
  return (
    <Pill tone={value}>
      <Dot tone={value} />
      {PROGRESS_LABEL[value]}
    </Pill>
  );
}

// ---------- 忙しさ ----------

export const BUSY = [
  null,
  { label: "余裕あり", icon: "cup-line" },
  { label: "ふつう", icon: "walk-line" },
  { label: "忙しい", icon: "run-line" },
] as const;

const busy = tv({
  slots: {
    root: "inline-flex items-center gap-2 text-caption font-semibold text-text-2 [&_i]:text-base",
    meter: "inline-flex h-[14px] items-end gap-[2px]",
    bar: "w-[5px] rounded-[2px] bg-border nth-1:h-[6px] nth-2:h-[10px] nth-3:h-[14px]",
  },
  variants: {
    level: { 1: { bar: "data-[on=true]:bg-green" }, 2: { bar: "data-[on=true]:bg-yellow" }, 3: { root: "text-red", bar: "data-[on=true]:bg-red" } },
  },
});

/** 3 段のメーター。label を付けるとアイコンと文字も出す。 */
export function Busy({ value, label = false }: { value: number | null; label?: boolean }) {
  const level = value === 1 || value === 2 || value === 3 ? value : null;
  if (!level) return null;
  const b = BUSY[level]!;
  const styles = busy({ level });
  return (
    <span className={styles.root()} title={`忙しさ：${b.label}`}>
      {label && <Icon name={b.icon} />}
      <span className={styles.meter()} aria-hidden="true">
        {[1, 2, 3].map((n) => <span key={n} className={styles.bar()} data-on={n <= level} />)}
      </span>
      {label ? <span>{b.label}</span> : <span className="sr-only">忙しさ：{b.label}</span>}
    </span>
  );
}

// ---------- 確認事項 ----------

const STATE_STYLE: Record<ItemState, { tone: "neutral" | "yellow" | "purple" | "green" | "red" | "accent"; icon: string }> = {
  open: { tone: "yellow", icon: "time-line" },
  live: { tone: "purple", icon: "mic-line" },
  decided: { tone: "green", icon: "check-double-line" },
  resolved: { tone: "neutral", icon: "check-line" },
  deferred: { tone: "red", icon: "skip-forward-line" },
};

export function StatePill({ state }: { state: ItemState }) {
  const s = STATE_STYLE[state];
  return (
    <Pill tone={s.tone}>
      <Icon name={s.icon} />
      {ITEM_STATE_LABEL[state]}
    </Pill>
  );
}

export const STATE_ICON = (state: ItemState) => STATE_STYLE[state].icon;

/** 他局・実行委員全体に関わる */
export function CrossBureau({ on }: { on: boolean }) {
  return on ? (
    <Pill tone="accent" title="他局・実行委員全体に関わる">
      <Icon name="community-line" />
      他局
    </Pill>
  ) : null;
}

export const KIND_LABEL = { confirm: "確認したいこと", talk: "話したいこと" } as const;
export const KIND_ICON = { confirm: "question-answer-line", talk: "chat-smile-2-line" } as const;

const kindIcon = tv({
  base: "inline-grid size-6 shrink-0 place-items-center rounded-lg text-body",
  variants: { kind: { confirm: "bg-accent-soft text-accent", talk: "bg-purple-soft text-purple" } },
});

/** 確認したいこと / 話したいこと。文字は出さず、アイコンだけ */
export function KindIcon({ kind }: { kind: "confirm" | "talk" }) {
  return (
    <span className={kindIcon({ kind })} title={KIND_LABEL[kind]}>
      <Icon name={KIND_ICON[kind]} label={KIND_LABEL[kind]} />
    </span>
  );
}

/** コメント数・リアクション数。0 のものは出さない */
export function Counts({ comments, reactions }: { comments: number; reactions: number }) {
  if (!comments && !reactions) return null;
  return (
    <span className="inline-flex gap-3 text-caption font-semibold text-muted">
      {comments > 0 && (
        <span className="inline-flex items-center gap-1" title={`コメント ${comments} 件`}>
          <Icon name="chat-3-line" />
          {comments}
        </span>
      )}
      {reactions > 0 && (
        <span className="inline-flex items-center gap-1" title={`リアクション ${reactions} 件`}>
          <Icon name="emotion-line" />
          {reactions}
        </span>
      )}
    </span>
  );
}

// ---------- 記録 ----------

const RECORD_STYLE: Record<RecordKind, { tone: "neutral" | "yellow" | "purple" | "green" | "red" | "accent"; icon: string }> = {
  decision: { tone: "green", icon: "checkbox-circle-line" },
  todo: { tone: "accent", icon: "task-line" },
  carryover: { tone: "red", icon: "arrow-go-forward-line" },
};

export function RecordPill({ kind }: { kind: RecordKind }) {
  const s = RECORD_STYLE[kind];
  return (
    <Pill tone={s.tone}>
      <Icon name={s.icon} />
      {RECORD_KIND_LABEL[kind]}
    </Pill>
  );
}

const SOURCE_STYLE = {
  minutes: { icon: "file-text-line", label: "議事録" },
  thread: { icon: "chat-3-line", label: "スレッド" },
  manual: { icon: "pencil-line", label: "手入力" },
} as const;

/** 記録がどこから来たか */
export function SourceBadge({ source }: { source: keyof typeof SOURCE_STYLE }) {
  const s = SOURCE_STYLE[source];
  return (
    <Badge source={source}>
      <Icon name={s.icon} />
      {s.label}
    </Badge>
  );
}

/** ユニット詳細と横断一覧で共有する記録のタイトル。 */
export const recordTitle = tv({
  base: "text-body leading-relaxed font-bold",
  variants: { done: { true: "text-muted line-through" } },
});
