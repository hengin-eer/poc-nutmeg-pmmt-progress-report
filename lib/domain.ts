// フレームワークに依存しないロジック。本番で FW を作り直す時もそのまま持っていける。

// ---------- 確認事項の種別 ----------
export const ITEM_KINDS = ["confirm", "talk"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

// ---------- 認証 ----------

/** NUTMEG の Google アカウントの形式（例: 25.t.yamada.nutfes@gmail.com） */
export const MEMBER_EMAIL_PATTERN = /^\d{2}\.[a-z]\.[a-z]+\.nutfes@gmail\.com$/;

/**
 * ログインしてよいアドレスか。
 * ⚠️ 同じ形のアドレスは誰でも作れるので、これだけでは安全ではない（Design Doc §9）。
 * 実際に使えるのは、さらに members テーブルに登録された人だけ。
 */
export function isAllowedEmail(email: string): boolean {
  return MEMBER_EMAIL_PATTERN.test(email.trim().toLowerCase());
}

export type Role = "lead" | "chief" | "vice" | "viewer";
export const isAdminRole = (role: Role) => role === "chief" || role === "vice";

// ---------- 日時（JST） ----------

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** JST の年月日時分から UTC の Date を作る */
export function jstDate(y: number, m: number, d: number, hh = 0, mm = 0): Date {
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - JST_OFFSET_MS);
}

/** 次の PMMT（月曜 20:00 JST）を返す。 */
export function defaultMeetingAt(now: Date): Date {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const dow = jst.getUTCDay(); // 0=日, 1=月
  let addDays = (1 - dow + 7) % 7;
  if (addDays === 0 && jst.getUTCHours() >= 20) addDays = 7;
  const base = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate() + addDays));
  return jstDate(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), 20, 0);
}

const fmt = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const fmtDate = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

export const formatJst = (iso: string | Date) => fmt.format(new Date(iso));
export const formatJstDate = (iso: string | Date) => fmtDate.format(new Date(iso));

const fmtMeetingDate = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});
export const cycleLabel = (meetingAt: string) => `${fmtMeetingDate.format(new Date(meetingAt))} の PMMT 分`;

/** <input type="datetime-local"> 用の JST 文字列 */
export function toJstInput(iso: string | Date): string {
  const d = new Date(new Date(iso).getTime() + JST_OFFSET_MS);
  return d.toISOString().slice(0, 16);
}
/** <input type="datetime-local"> の JST 文字列を ISO (UTC) に */
function fromJstInput(value: string): string | null {
  const date = new Date(`${value}:00+09:00`);
  return Number.isFinite(date.getTime()) && toJstInput(date) === value ? date.toISOString() : null;
}

// ---------- 回 ----------

type CycleSchedule = { meetingAt: string; deadlineAt: string };
type CycleStatus = "open" | "closed";

export function selectCurrentCycle<T extends CycleSchedule & { id: number; status: CycleStatus }>(cycles: readonly T[]): T | null {
  const open = cycles.filter((cycle) => cycle.status === "open");
  const date = open.length ? "deadlineAt" : "meetingAt";
  return (open.length ? open : cycles).reduce<T | null>((current, cycle) => {
    if (!current || cycle[date] > current[date] || (cycle[date] === current[date] && cycle.id > current.id)) return cycle;
    return current;
  }, null);
}

export function validateCycleSchedule(input: CycleSchedule): { schedule: CycleSchedule } | { errors: Record<string, string> } {
  const meetingAt = fromJstInput(input.meetingAt);
  const deadlineAt = fromJstInput(input.deadlineAt);
  if (!meetingAt) return { errors: { meetingAt: "会議日時を入れてください" } };
  if (!deadlineAt) return { errors: { deadlineAt: "締切を入れてください" } };
  if (deadlineAt >= meetingAt) return { errors: { deadlineAt: "締切は会議より前にしてください" } };
  return { schedule: { meetingAt, deadlineAt } };
}

export function validateCycleCreation(meetingAt: string, past: boolean, now: Date): string | null {
  const meetingIsPast = new Date(meetingAt).getTime() < now.getTime();
  if (past && !meetingIsPast) return "過去の回の会議日時は過去にしてください";
  if (!past && meetingIsPast) return "過去の回なら「過去の回として作る」を選んでください";
  return null;
}

export function isAfterDeadline(at: string | null | undefined, deadlineAt: string): boolean {
  return Boolean(at && new Date(at).getTime() > new Date(deadlineAt).getTime());
}

/** 締切までの残り時間を「あと 2 日 3 時間」のように */
export function remainingLabel(deadlineIso: string, now: Date): string {
  const ms = new Date(deadlineIso).getTime() - now.getTime();
  if (ms <= 0) return "締切を過ぎています";
  const h = Math.floor(ms / (60 * 60 * 1000));
  const d = Math.floor(h / 24);
  if (d > 0) return `あと ${d} 日 ${h % 24} 時間`;
  const m = Math.floor((ms % (60 * 60 * 1000)) / 60000);
  return h > 0 ? `あと ${h} 時間 ${m} 分` : `あと ${m} 分`;
}

// ---------- Slack 通知のタイミング ----------

export type NotifyKind = "remind48" | "remind24" | "deadline";

/** cron（毎時）から呼ぶ。今送るべき通知を返す（締切の 48h 前・24h 前・締切時） */
export function dueNotifications(
  cycle: { deadlineAt: string; remind48SentAt: string | null; remind24SentAt: string | null; deadlineSentAt: string | null },
  now: Date,
): NotifyKind[] {
  const left = new Date(cycle.deadlineAt).getTime() - now.getTime();
  const hour = 60 * 60 * 1000;
  if (left <= 0) return cycle.deadlineSentAt ? [] : ["deadline"];
  if (left <= 24 * hour) return cycle.remind24SentAt ? [] : ["remind24"];
  if (left <= 48 * hour) return cycle.remind48SentAt ? [] : ["remind48"];
  return [];
}

// ---------- 確認事項の状態 ----------

export type ItemState = "open" | "decided" | "live" | "resolved" | "deferred";

export const ITEM_STATE_LABEL: Record<ItemState, string> = {
  open: "未解決",
  decided: "決定",
  live: "当日に話す",
  resolved: "解決済み",
  deferred: "先送り",
};

/** 今の状態から移れる先（Design Doc §7-3） */
export function nextStates(state: ItemState): ItemState[] {
  switch (state) {
    case "open":
      return ["decided", "live", "resolved"];
    case "live":
      return ["decided", "deferred", "open"];
    default:
      return ["open"]; // 閉じたものは開き直せる
  }
}

/** 閉じる時に記録を作るか */
export function recordKindFor(state: ItemState): "decision" | "carryover" | null {
  if (state === "decided") return "decision";
  if (state === "deferred") return "carryover";
  return null;
}

export const REACTIONS = ["👍", "👀", "🙏", "🎉", "❓"] as const;

// ---------- 記録 ----------

export type RecordKind = "decision" | "todo" | "carryover";
export const RECORD_KIND_LABEL: Record<RecordKind, string> = {
  decision: "決まったこと",
  todo: "TODO",
  carryover: "先送りした議題",
};

// ---------- 議事録の取り込み（Design Doc §7-5, §7-6） ----------

export type MinutesCandidate = {
  kind: RecordKind;
  unitName: string | null;
  title: string;
  body: string;
};

const SECTION_KIND: Record<string, RecordKind | "summary"> = {
  決まったこと: "decision",
  決定事項: "decision",
  TODO: "todo",
  ToDo: "todo",
  先送りした議題: "carryover",
  持ち越し: "carryover",
  要約: "summary",
};

/**
 * 議事録スキルの出力（見出し固定の Markdown）を、1 件ずつの候補に分ける。
 *
 *   # PMMT 2026-10-26
 *   ## 決まったこと
 *   - [FinanSu] タイトル: 補足
 *   ## TODO
 *   - [副局長] やること
 *   ## 先送りした議題
 *   - [局長] 議題
 *   ## 要約
 *   自由な文章
 */
export function parseMinutes(markdown: string): { date: string | null; summary: string; candidates: MinutesCandidate[] } {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let section: RecordKind | "summary" | null = null;
  let date: string | null = null;
  const summary: string[] = [];
  const candidates: MinutesCandidate[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    // 「---」より下はスキルのチェック結果なので読まない。<!-- --> のコメント行も飛ばす
    if (line.trim() === "---") break;
    if (line.trim().startsWith("<!--")) continue;
    const h1 = line.match(/^#\s+.*?(\d{4}-\d{2}-\d{2})/);
    if (h1) {
      date = h1[1];
      continue;
    }
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      section = SECTION_KIND[h2[1]] ?? null;
      continue;
    }
    if (!section) continue;
    if (section === "summary") {
      summary.push(raw);
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(?:\[([^\]]+)\]\s*)?(.+)$/);
    if (!bullet) {
      // 箇条書きの続きの行は、直前の候補の補足に足す
      const last = candidates.at(-1);
      if (last && line.trim()) last.body = [last.body, line.trim()].filter(Boolean).join("\n");
      continue;
    }
    const [, unitName, text] = bullet;
    const sep = text.search(/[:：]/);
    const title = (sep > 0 ? text.slice(0, sep) : text).trim();
    const body = sep > 0 ? text.slice(sep + 1).trim() : "";
    if (!title) continue;
    candidates.push({ kind: section, unitName: unitName?.trim() || null, title, body });
  }
  return { date, summary: summary.join("\n").trim(), candidates };
}

/** 記録を Markdown に書き出す（NUTMEG 便りや AI に渡す材料） */
export function recordsToMarkdown(
  rows: { kind: RecordKind; title: string; body: string; unitName: string | null; meetingAt: string; doneAt: string | null }[],
): string {
  const out: string[] = ["# NUTMEG PMMT 記録", ""];
  for (const kind of ["decision", "todo", "carryover"] as RecordKind[]) {
    const list = rows.filter((r) => r.kind === kind);
    if (!list.length) continue;
    out.push(`## ${RECORD_KIND_LABEL[kind]}`, "");
    for (const r of list) {
      const done = kind === "decision" ? "" : r.doneAt ? "[x] " : "[ ] ";
      const unit = r.unitName ? `[${r.unitName}] ` : "";
      out.push(`- ${done}${unit}${r.title}（${formatJstDate(r.meetingAt)} の PMMT）`);
      if (r.body) out.push(...r.body.split("\n").map((l) => `  ${l}`));
    }
    out.push("");
  }
  return out.join("\n");
}
