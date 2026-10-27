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

export const BUSY_LABEL = ["", "余裕あり", "ふつう", "忙しい"];

export function ProgressPill({ value }: { value: Progress }) {
  if (!value) return null;
  return (
    <span className={`pill ${value}`}>
      <span className={`dot ${value}`} />
      {PROGRESS_LABEL[value]}
    </span>
  );
}

export function Busy({ value }: { value: number | null }) {
  if (!value) return <span className="meta">忙しさ —</span>;
  return (
    <span className="row" style={{ gap: 6 }} title={`忙しさ: ${BUSY_LABEL[value]}`}>
      <span className="busy" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <i key={n} className={n <= value ? "on" : ""} />
        ))}
      </span>
      <span className="meta">{BUSY_LABEL[value]}</span>
    </span>
  );
}

const STATE_CLASS: Record<ItemState, string> = {
  open: "yellow",
  live: "purple",
  decided: "green",
  resolved: "",
  deferred: "red",
};

export function StatePill({ state }: { state: ItemState }) {
  return <span className={`pill ${STATE_CLASS[state]}`}>{ITEM_STATE_LABEL[state]}</span>;
}

const RECORD_CLASS: Record<RecordKind, string> = { decision: "green", todo: "accent", carryover: "red" };

export function RecordPill({ kind }: { kind: RecordKind }) {
  return <span className={`pill ${RECORD_CLASS[kind]}`}>{RECORD_KIND_LABEL[kind]}</span>;
}

export function CrossBureau({ on }: { on: boolean }) {
  return on ? <span className="pill accent">他局・実行委員</span> : null;
}

export function KindLabel({ kind }: { kind: "confirm" | "talk" }) {
  return <span className="pill">{kind === "confirm" ? "確認したいこと" : "話したいこと"}</span>;
}
