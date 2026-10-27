import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultSchedule, dueNotifications, isAllowedEmail, jstDate, nextStates, parseMinutes, recordKindFor } from "./domain.ts";

test("isAllowedEmail: NUTMEG 形式だけ通す", () => {
  assert.equal(isAllowedEmail("25.t.yamada.nutfes@gmail.com"), true);
  assert.equal(isAllowedEmail("25.T.Yamada.nutfes@gmail.com"), true);
  assert.equal(isAllowedEmail("yamada@gmail.com"), false);
  assert.equal(isAllowedEmail("25.t.yamada.nutfes@gmail.com.evil.com"), false);
});

test("defaultSchedule: 水曜なら次の月曜 20:00、締切は金曜 12:00", () => {
  const { meetingAt, deadlineAt } = defaultSchedule(jstDate(2026, 10, 28, 10, 0)); // 水
  assert.equal(meetingAt.toISOString(), jstDate(2026, 11, 2, 20, 0).toISOString());
  assert.equal(deadlineAt.toISOString(), jstDate(2026, 10, 30, 12, 0).toISOString());
});

test("defaultSchedule: 月曜 PMMT 後なら翌週", () => {
  const { meetingAt } = defaultSchedule(jstDate(2026, 11, 2, 22, 30));
  assert.equal(meetingAt.toISOString(), jstDate(2026, 11, 9, 20, 0).toISOString());
});

test("dueNotifications: 送っていないものだけ返す", () => {
  const deadline = jstDate(2026, 10, 30, 12, 0).toISOString();
  const base = { deadlineAt: deadline, remind48SentAt: null, remind24SentAt: null, deadlineSentAt: null };
  assert.deepEqual(dueNotifications(base, jstDate(2026, 10, 27, 12, 0)), []);
  assert.deepEqual(dueNotifications(base, jstDate(2026, 10, 28, 13, 0)), ["remind48"]);
  assert.deepEqual(dueNotifications(base, jstDate(2026, 10, 29, 13, 0)), ["remind24"]);
  assert.deepEqual(dueNotifications({ ...base, remind24SentAt: "x" }, jstDate(2026, 10, 29, 13, 0)), []);
  assert.deepEqual(dueNotifications(base, jstDate(2026, 10, 30, 12, 5)), ["deadline"]);
});

test("確認事項の状態遷移と記録", () => {
  assert.deepEqual(nextStates("open"), ["decided", "live", "resolved"]);
  assert.deepEqual(nextStates("live"), ["decided", "deferred", "open"]);
  assert.equal(recordKindFor("decided"), "decision");
  assert.equal(recordKindFor("deferred"), "carryover");
  assert.equal(recordKindFor("resolved"), null);
});

test("parseMinutes: 見出しごとに候補に分ける", () => {
  const md = `# PMMT 2026-10-26 議事録

## 決まったこと
- [FinanSu] 予算申請フローを Slack ワークフローにする: 11 月から運用
- 局の MVV は 11 月中に決める

## TODO
- [副局長] 所属存続アンケートのリマインドを送る
  回答状況も次回確認する

## 先送りした議題
- [局長] 他局向け説明会の日程

## 要約
新しい代の初回 PMMT。
`;
  const r = parseMinutes(md);
  assert.equal(r.date, "2026-10-26");
  assert.equal(r.summary, "新しい代の初回 PMMT。");
  assert.equal(r.candidates.length, 4);
  assert.deepEqual(r.candidates[0], { kind: "decision", unitName: "FinanSu", title: "予算申請フローを Slack ワークフローにする", body: "11 月から運用" });
  assert.equal(r.candidates[1].unitName, null);
  assert.equal(r.candidates[2].kind, "todo");
  assert.equal(r.candidates[2].body, "回答状況も次回確認する");
  assert.equal(r.candidates[3].kind, "carryover");
});

test("parseMinutes: コメント行と --- 以降は無視する", () => {
  const md = `## TODO
- [Seeds] ハンズオンの日程を決める
<!-- 要確認: 担当者が聞き取れない -->

## 要約
短い要約
---
決まったこと 0 / TODO 1`;
  const r = parseMinutes(md);
  assert.equal(r.candidates.length, 1);
  assert.equal(r.candidates[0].body, "");
  assert.equal(r.summary, "短い要約");
});
