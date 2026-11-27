import { cycles, items, members, reports, units } from "@schema";
import { defineScheduled } from "void";
import { and, db, eq, isNotNull } from "void/db";
import { env } from "void/env";
import { cycleLabel, dueNotifications, formatJst, type NotifyKind } from "../lib/domain";
import { mention, postToSlack } from "../lib/slack";

// 毎時 0 分に、開いている回の締切を見て Slack に通知する（Design Doc §6）
export const cron = "0 * * * *";

export default defineScheduled(async () => {
  const now = new Date();
  const openCycles = await db.select().from(cycles).where(eq(cycles.status, "open"));
  for (const cycle of openCycles) {
    for (const kind of dueNotifications(cycle, now)) {
      await postToSlack(await buildMessage(cycle, kind));
      const at = now.toISOString();
      const patch =
        kind === "remind48" ? { remind48SentAt: at } : kind === "remind24" ? { remind24SentAt: at } : { deadlineSentAt: at };
      await db.update(cycles).set(patch).where(eq(cycles.id, cycle.id));
    }
  }
});

async function buildMessage(
  { id: cycleId, deadlineAt, meetingAt }: Pick<typeof cycles.$inferSelect, "id" | "deadlineAt" | "meetingAt">,
  kind: NotifyKind,
): Promise<string> {
  const allUnits = await db.select().from(units);
  const submitted = new Set(
    (
      await db
        .select({ unitId: reports.unitId })
        .from(reports)
        .where(and(eq(reports.cycleId, cycleId), isNotNull(reports.submittedAt)))
    ).map((r) => r.unitId),
  );
  const missing = allUnits.filter((u) => !submitted.has(u.id));
  const missingMembers = (await db.select().from(members)).filter((m) => m.unitId && missing.some((u) => u.id === m.unitId));
  const path = kind === "deadline" ? "/" : "/report";
  const link = new URL(`${path}?cycle=${cycleId}`, env.APP_URL).href;
  const schedule = `${cycleLabel(meetingAt)}・締切 ${formatJst(deadlineAt)}`;

  if (kind === "deadline") {
    const openItems = (await db.select().from(items).where(and(eq(items.cycleId, cycleId), eq(items.state, "open")))).length;
    return [
      `:alarm_clock: *事前記入の締切です*（${schedule}）`,
      `記入済み ${submitted.size} / ${allUnits.length}`,
      missing.length ? `未記入: ${missing.map((u) => u.name).join("、")}` : "全員記入済み :tada:",
      `未解決の確認事項: ${openItems} 件`,
      link,
    ].join("\n");
  }
  if (!missing.length) return `:sparkles: 全員の事前記入が終わっています（${schedule}）\n${link}`;
  return [
    `:memo: *事前記入のリマインド*（${schedule}）`,
    `まだの人: ${missingMembers.map(mention).join(" ") || missing.map((u) => u.name).join("、")}`,
    link,
  ].join("\n");
}
