import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultMeetingAt, dueNotifications, isAfterDeadline, isAllowedEmail, jstDate, nextStates, parseMinutes, recordKindFor, selectCurrentCycle, validateCycleCreation, validateCycleSchedule } from "./domain.ts";

test("isAllowedEmail: NUTMEG 形式だけ通す", () => {
  assert.equal(isAllowedEmail("25.t.yamada.nutfes@gmail.com"), true);
  assert.equal(isAllowedEmail("25.T.Yamada.nutfes@gmail.com"), true);
  assert.equal(isAllowedEmail("yamada@gmail.com"), false);
  assert.equal(isAllowedEmail("25.t.yamada.nutfes@gmail.com.evil.com"), false);
});

test("defaultMeetingAt: 水曜なら次の月曜 20:00", () => {
  assert.deepEqual(defaultMeetingAt(jstDate(2026, 10, 28, 10)), jstDate(2026, 11, 2, 20));
});

test("defaultMeetingAt: 月曜 20:00 以降は翌週", () => {
  assert.deepEqual(defaultMeetingAt(jstDate(2026, 11, 2, 19, 59)), jstDate(2026, 11, 2, 20));
  assert.deepEqual(defaultMeetingAt(jstDate(2026, 11, 2, 20)), jstDate(2026, 11, 9, 20));
});

const deadlineAt = "2026-11-27T03:00:00.000Z";
const meetingAt = "2026-11-30T11:00:00.000Z";

test("今の回: 受付中なら締切順、同じ締切なら ID 順", () => {
  const first = { id: 1, status: "open", deadlineAt, meetingAt } as const;
  const tied = { ...first, id: 2, meetingAt: "2026-11-29T11:00:00.000Z" };
  const earlier = { ...first, id: 3, deadlineAt: "2026-11-26T03:00:00.000Z", meetingAt: "2026-12-07T11:00:00.000Z" };
  const closed = { ...earlier, id: 4, status: "closed", deadlineAt: "2026-12-04T03:00:00.000Z" } as const;
  assert.equal(selectCurrentCycle([earlier, tied, first, closed]), tied);
});

test("今の回: 受付中がなければ会議がいちばん新しい回", () => {
  const latest = { id: 1, status: "closed", deadlineAt, meetingAt } as const;
  const earlier = { ...latest, id: 2, deadlineAt: "2026-11-28T03:00:00.000Z", meetingAt: "2026-11-29T11:00:00.000Z" };
  assert.equal(selectCurrentCycle([earlier, latest]), latest);
  assert.equal(selectCurrentCycle([]), null);
});

test("日程: JST 入力を変換し、締切が会議より前のときだけ通す", () => {
  const meeting = "2026-11-30T20:00";
  assert.deepEqual(validateCycleSchedule({ meetingAt: meeting, deadlineAt: "2026-11-27T12:00" }), { schedule: { meetingAt, deadlineAt } });
  for (const deadline of ["", meeting, "2026-12-01T20:00", "2026-11-31T12:00"]) {
    assert.ok("errors" in validateCycleSchedule({ meetingAt: meeting, deadlineAt: deadline }));
  }
  assert.ok("errors" in validateCycleSchedule({ meetingAt: "不正", deadlineAt: "2026-11-27T12:00" }));
});

test("過去の回: 会議が過去のときだけ選択が必要で、締切が過去でも作れる", () => {
  const now = jstDate(2026, 11, 28);
  assert.equal(validateCycleCreation(meetingAt, false, now), null);
  assert.ok(validateCycleCreation(meetingAt, true, now));
  assert.equal(validateCycleCreation(deadlineAt, true, now), null);
  assert.ok(validateCycleCreation(deadlineAt, false, now));
  assert.ok(validateCycleCreation(meetingAt, true, new Date(meetingAt)));
});

test("締切後: 締切と同時・それ以前・未提出には付かない", () => {
  const submittedAt = "2026-11-27T03:00:00.001Z";
  assert.equal(isAfterDeadline(submittedAt, deadlineAt), true);
  assert.equal(isAfterDeadline(submittedAt, meetingAt), false);
  assert.equal(isAfterDeadline(deadlineAt, deadlineAt), false);
  assert.equal(isAfterDeadline(null, deadlineAt), false);
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
