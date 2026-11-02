import { ITEM_STATE_LABEL, RECORD_KIND_LABEL, type ItemKind, type ItemState, type RecordKind } from "../lib/domain";
import { Badge, Dot, Icon, Pill } from "./ui";
import { tv } from "./ui/styles";

export type Progress = ProgressValue | null;
export type UnitKind = "project" | "team" | "chief" | "vice";

export const PROGRESS_OPTIONS = [
  { value: "green", label: "順調" },
  { value: "yellow", label: "注意" },
  { value: "red", label: "困っている" },
] as const;
export type ProgressValue = (typeof PROGRESS_OPTIONS)[number]["value"];
export const getProgressOption = (value: Progress) => PROGRESS_OPTIONS.find((option) => option.value === value);

export const UNIT_KIND_LABEL: Record<UnitKind, string> = {
  project: "プロジェクト",
  team: "チーム",
  chief: "局長（実行委員の視点）",
  vice: "副局長（情報局の視点）",
};

/** カードなどに出す短い呼び方 */
export const UNIT_KIND_SHORT: Record<UnitKind, string> = { project: "PJ", team: "チーム", chief: "局長", vice: "副局長" };

type ProgressPillProps = { value: Progress };

export function ProgressPill({ value }: ProgressPillProps) {
  const option = getProgressOption(value);
  if (!option) return null;
  return (
    <Pill tone={option.value}>
      <Dot tone={option.value} />
      {option.label}
    </Pill>
  );
}

// ---------- 忙しさ ----------

export const BUSY_OPTIONS = [
  { value: 1, label: "余裕あり", icon: "cup-line" },
  { value: 2, label: "ふつう", icon: "walk-line" },
  { value: 3, label: "忙しい", icon: "run-line" },
] as const;
export type BusyValue = (typeof BUSY_OPTIONS)[number]["value"];
export const getBusyOption = (value: number | null) => BUSY_OPTIONS.find((option) => option.value === value);

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
type BusyProps = { value: number | null; label?: boolean };

export function Busy({ value, label = false }: BusyProps) {
  const option = getBusyOption(value);
  if (!option) return null;
  const currentBusyness = option.value;
  const styles = busy({ level: currentBusyness });

  function isBusyLevelOn(level: BusyValue) {
    return level <= currentBusyness;
  }

  return (
    <span className={styles.root()} title={`忙しさ：${option.label}`}>
      {label && <Icon name={option.icon} />}
      <span className={styles.meter()} aria-hidden="true">
        {BUSY_OPTIONS.map(({ value: level }) => (
          <span key={level} className={styles.bar()} data-on={isBusyLevelOn(level)} />
        ))}
      </span>
      {label ? <span>{option.label}</span> : <span className="sr-only">忙しさ：{option.label}</span>}
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

type StatePillProps = { state: ItemState };

export function StatePill({ state }: StatePillProps) {
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
type CrossBureauProps = { on: boolean };

export function CrossBureau({ on }: CrossBureauProps) {
  return on ? (
    <Pill tone="accent" title="他局・実行委員全体に関わる">
      <Icon name="community-line" />
      他局
    </Pill>
  ) : null;
}

type ItemKindConfig = {
  label: string;
  icon: string;
  hint: string;
  placeholder: string;
  allowsCrossBureau: boolean;
};

export const ITEM_KIND_CONFIG: Record<ItemKind, ItemKindConfig> = {
  confirm: {
    label: "確認したいこと",
    icon: "question-answer-line",
    hint: "判断や返事がほしいことを 1 件ずつ",
    placeholder: "例: ○○を△△にしてもいい？",
    allowsCrossBureau: true,
  },
  talk: {
    label: "話したいこと",
    icon: "chat-smile-2-line",
    hint: "小話・アイデア・耳寄りな情報（任意）",
    placeholder: "例: こんな勉強会をやってみたい",
    allowsCrossBureau: false,
  },
};

const kindIcon = tv({
  base: "inline-grid size-6 shrink-0 place-items-center rounded-lg text-body",
  variants: { kind: { confirm: "bg-accent-soft text-accent", talk: "bg-purple-soft text-purple" } },
});

/** 確認したいこと / 話したいこと。文字は出さず、アイコンだけ */
type KindIconProps = { kind: ItemKind };

export function KindIcon({ kind }: KindIconProps) {
  return (
    <span className={kindIcon({ kind })} title={ITEM_KIND_CONFIG[kind].label}>
      <Icon name={ITEM_KIND_CONFIG[kind].icon} label={ITEM_KIND_CONFIG[kind].label} />
    </span>
  );
}

/** コメント数・リアクション数。0 のものは出さない */
type CountsProps = { comments: number; reactions: number };

export function Counts({ comments, reactions }: CountsProps) {
  const hasComments = comments > 0;
  const hasReactions = reactions > 0;
  if (!hasComments && !hasReactions) return null;
  return (
    <span className="inline-flex gap-3 text-caption font-semibold text-muted">
      {hasComments && (
        <span className="inline-flex items-center gap-1" title={`コメント ${comments} 件`}>
          <Icon name="chat-3-line" />
          {comments}
        </span>
      )}
      {hasReactions && (
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

type RecordPillProps = { kind: RecordKind };

export function RecordPill({ kind }: RecordPillProps) {
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
type SourceBadgeProps = { source: keyof typeof SOURCE_STYLE };

export function SourceBadge({ source }: SourceBadgeProps) {
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
