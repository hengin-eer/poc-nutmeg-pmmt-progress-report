import { ITEM_STATE_LABEL, RECORD_KIND_LABEL, type ItemState, type RecordKind } from "../lib/domain";

export type Progress = "green" | "yellow" | "red" | null;
export type UnitKind = "project" | "team" | "chief" | "vice";

/** Remix Icon（https://remixicon.com）。name は "ri-" を除いた名前 */
export function Icon({ name, className = "", label }: { name: string; className?: string; label?: string }) {
  return <i className={`ri-${name} icon ${className}`} aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} />;
}

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
    <span className={`pill ${value}`}>
      <span className={`dot ${value}`} />
      {PROGRESS_LABEL[value]}
    </span>
  );
}

// ---------- 忙しさ ----------

export const BUSY = [
  null,
  { label: "余裕あり", icon: "cup-line" },
  { label: "ふつう", icon: "walk-line" },
  { label: "忙しい", icon: "run-line" },
] as const;

/** 3 段のメーター。label を付けるとアイコンと文字も出す */
export function Busy({ value, label = false }: { value: number | null; label?: boolean }) {
  const b = value ? BUSY[value] : null;
  if (!b || !value) return null;
  return (
    <span className={`busy busy-${value}`} title={`忙しさ：${b.label}`}>
      {label && <Icon name={b.icon} />}
      <span className="busy-meter" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= value ? "on" : ""} />
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
    <span className={`pill ${s.cls}`}>
      <Icon name={s.icon} />
      {ITEM_STATE_LABEL[state]}
    </span>
  );
}

export const STATE_ICON = (state: ItemState) => STATE_STYLE[state].icon;

/** 他局・実行委員全体に関わる */
export function CrossBureau({ on }: { on: boolean }) {
  return on ? (
    <span className="pill accent" title="他局・実行委員全体に関わる">
      <Icon name="community-line" />
      他局
    </span>
  ) : null;
}

export const KIND_LABEL = { confirm: "確認したいこと", talk: "話したいこと" } as const;
export const KIND_ICON = { confirm: "question-answer-line", talk: "chat-smile-2-line" } as const;

/** 確認したいこと / 話したいこと。文字は出さず、アイコンだけ */
export function KindIcon({ kind }: { kind: "confirm" | "talk" }) {
  return (
    <span className={`kind-icon ${kind}`} title={KIND_LABEL[kind]}>
      <Icon name={KIND_ICON[kind]} label={KIND_LABEL[kind]} />
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
    <span className={`pill ${s.cls}`}>
      <Icon name={s.icon} />
      {RECORD_KIND_LABEL[kind]}
    </span>
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
    <span className={`source source-${source}`}>
      <Icon name={s.icon} />
      {s.label}
    </span>
  );
}
