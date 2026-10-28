import { ITEM_KINDS } from "../lib/domain";
import { sql } from "void/db";
import { integer, sqliteTable, text, uniqueIndex } from "void/schema-d1";

// 日時はすべて ISO 8601 (UTC) の文字列で持つ。表示する時に Asia/Tokyo に変換する。
const now = () => text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);

/** 報告ユニット：進捗を報告する単位（プロジェクト・チーム・局長・副局長） */
export const units = sqliteTable("units", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["project", "team", "chief", "vice"] }).notNull(),
  purpose: text("purpose").notNull().default(""),
  summary: text("summary").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: now(),
});

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["lead", "chief", "vice", "viewer"] }).notNull(),
  unitId: integer("unit_id").references(() => units.id),
  slackUserId: text("slack_user_id"),
  createdAt: now(),
});

/** 回：PMMT 1 回分 */
export const cycles = sqliteTable("cycles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  meetingAt: text("meeting_at").notNull(),
  deadlineAt: text("deadline_at").notNull(),
  status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  minutesSummary: text("minutes_summary").notNull().default(""),
  // Slack 通知を送ったかどうか（cron が二重に送らないため）
  remind48SentAt: text("remind48_sent_at"),
  remind24SentAt: text("remind24_sent_at"),
  deadlineSentAt: text("deadline_sent_at"),
  createdAt: now(),
});

/** 事前記入：回 × ユニットで 1 件 */
export const reports = sqliteTable(
  "reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cycleId: integer("cycle_id").notNull().references(() => cycles.id),
    unitId: integer("unit_id").notNull().references(() => units.id),
    authorId: integer("author_id").references(() => members.id),
    progress: text("progress", { enum: ["green", "yellow", "red"] }),
    busyness: integer("busyness"),
    done: text("done").notNull().default(""),
    next: text("next").notNull().default(""),
    submittedAt: text("submitted_at"),
    updatedAt: text("updated_at"),
    createdAt: now(),
  },
  (t) => [uniqueIndex("reports_cycle_unit").on(t.cycleId, t.unitId)],
);

/** 確認したいこと / 話したいこと：1 件ずつのアイテム */
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cycleId: integer("cycle_id").notNull().references(() => cycles.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  authorId: integer("author_id").references(() => members.id),
  kind: text("kind", { enum: ITEM_KINDS }).notNull(),
  body: text("body").notNull(),
  crossBureau: integer("cross_bureau", { mode: "boolean" }).notNull().default(false),
  state: text("state", { enum: ["open", "decided", "live", "resolved", "deferred"] }).notNull().default("open"),
  resolutionNote: text("resolution_note").notNull().default(""),
  closedById: integer("closed_by_id").references(() => members.id),
  closedAt: text("closed_at"),
  createdAt: now(),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull().references(() => items.id),
  authorId: integer("author_id").notNull().references(() => members.id),
  body: text("body").notNull(),
  createdAt: now(),
});

export const reactions = sqliteTable(
  "reactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    itemId: integer("item_id").notNull().references(() => items.id),
    memberId: integer("member_id").notNull().references(() => members.id),
    emoji: text("emoji").notNull(),
    createdAt: now(),
  },
  (t) => [uniqueIndex("reactions_unique").on(t.itemId, t.memberId, t.emoji)],
);

/** 記録：決まったこと・TODO・先送りした議題 */
export const records = sqliteTable("records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["decision", "todo", "carryover"] }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  unitId: integer("unit_id").references(() => units.id),
  cycleId: integer("cycle_id").notNull().references(() => cycles.id),
  sourceItemId: integer("source_item_id").references(() => items.id),
  source: text("source", { enum: ["thread", "minutes", "manual"] }).notNull(),
  doneAt: text("done_at"),
  createdAt: now(),
});
