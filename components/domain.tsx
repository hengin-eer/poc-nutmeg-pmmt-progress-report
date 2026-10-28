import { Icon, Pill, Badge } from "./ui";
import { ITEM_STATE_LABEL, RECORD_KIND_LABEL, type ItemKind, type ItemState, type RecordKind } from "../lib/domain";

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

export function ProgressPill({ value }: { value: Progress }) {
  const option = getProgressOption(value);
  if (!option) return null;
  return (
    <Pill className={`pill ${value}`}>
      <span className={`dot ${value}`} />
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

/** 3 段のメーター。label を付けるとアイコンと文字も出す */
export function Busy({ value, label = false }: { value: number | null; label?: boolean }) {
  const b = getBusyOption(value);
  if (!b || !value) return null;
  return (
    <span className={`busy busy-${value}`} title={`忙しさ：${b.label}`}>
      {label && <Icon name={b.icon} />}
      <span className="busy-meter" aria-hidden="true">
        {BUSY_OPTIONS.map(({ value: level }) => (
          <span key={level} className={level <= value ? "on" : ""} />
        ))}
      </span>
      {label ? <span>{b.label}</span> : <span className="sr-only">忙しさ：{b.label}</span>}
    </span>
  );
}

// ---------- 確認事項 ----------

const STATE_STYLE: Record<ItemState, { cls: string; icon: string }> = {
  open: { cls: "yellow", icon: "time-line" },
  live: { cls: "purple", icon: "mic-line" },
  decided: { cls: "green", icon: "check-double-line" },
  resolved: { cls: "", icon: "check-line" },
  deferred: { cls: "red", icon: "skip-forward-line" },
};

export function StatePill({ state }: { state: ItemState }) {
  const s = STATE_STYLE[state];
  return (
    <Pill className={`pill ${s.cls}`}>
      <Icon name={s.icon} />
      {ITEM_STATE_LABEL[state]}
    </Pill>
  );
}

export const STATE_ICON = (state: ItemState) => STATE_STYLE[state].icon;

/** 他局・実行委員全体に関わる */
export function CrossBureau({ on }: { on: boolean }) {
  return on ? (
    <Pill className="pill accent" title="他局・実行委員全体に関わる">
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

/** 確認したいこと / 話したいこと。文字は出さず、アイコンだけ */
export function KindIcon({ kind }: { kind: ItemKind }) {
  return (
    <span className={`kind-icon ${kind}`} title={ITEM_KIND_CONFIG[kind].label}>
      <Icon name={ITEM_KIND_CONFIG[kind].icon} label={ITEM_KIND_CONFIG[kind].label} />
    </span>
  );
}

/** コメント数・リアクション数。0 のものは出さない */
export function Counts({ comments, reactions }: { comments: number; reactions: number }) {
  if (!comments && !reactions) return null;
  return (
    <span className="counts">
      {comments > 0 && (
        <span title={`コメント ${comments} 件`}>
          <Icon name="chat-3-line" />
          {comments}
        </span>
      )}
      {reactions > 0 && (
        <span title={`リアクション ${reactions} 件`}>
          <Icon name="emotion-line" />
          {reactions}
        </span>
      )}
    </span>
  );
}

// ---------- 記録 ----------

const RECORD_STYLE: Record<RecordKind, { cls: string; icon: string }> = {
  decision: { cls: "green", icon: "checkbox-circle-line" },
  todo: { cls: "accent", icon: "task-line" },
  carryover: { cls: "red", icon: "arrow-go-forward-line" },
};

export function RecordPill({ kind }: { kind: RecordKind }) {
  const s = RECORD_STYLE[kind];
  return (
    <Pill className={`pill ${s.cls}`}>
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
    <Badge className={`source source-${source}`}>
      <Icon name={s.icon} />
      {s.label}
    </Badge>
  );
}
