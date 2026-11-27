import { cycles, items, members, records, reports, units } from "@schema";
import { defineHandler, type InferProps } from "void";
import { and, asc, count, db, desc, eq, isNotNull, sql } from "void/db";
import { ValidationError } from "void/handler";
import { z } from "zod";
import { defaultMeetingAt, isAllowedEmail, validateCycleCreation, validateCycleSchedule } from "../../lib/domain";
import { requireAdmin } from "../../lib/server";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  requireAdmin(c);
  const cycleList = await db.select().from(cycles).orderBy(desc(cycles.meetingAt));
  const submitted = await db
    .select({ cycleId: reports.cycleId, n: count() })
    .from(reports)
    .where(isNotNull(reports.submittedAt))
    .groupBy(reports.cycleId);
  const unitList = await db.select().from(units).orderBy(asc(units.sortOrder));
  const memberList = await db
    .select({ id: members.id, name: members.name, email: members.email, role: members.role, unitId: members.unitId, slackUserId: members.slackUserId })
    .from(members)
    .orderBy(asc(members.id));
  return {
    cycles: cycleList.map((cy) => ({ ...cy, submitted: submitted.find((s) => s.cycleId === cy.id)?.n ?? 0 })),
    units: unitList,
    members: memberList,
    defaults: { meetingAt: defaultMeetingAt(new Date()).toISOString() },
  };
});

/** 回を閉じる。「当日に話す」のまま残ったものは「先送り」にして記録に残す */
async function closeCycle(cycleId: number) {
  const leftovers = await db.select().from(items).where(and(eq(items.cycleId, cycleId), eq(items.state, "live")));
  for (const it of leftovers) {
    await db.update(items).set({ state: "deferred", resolutionNote: "PMMT で扱いきれず持ち越し" }).where(eq(items.id, it.id));
    await db.insert(records).values({
      kind: "carryover",
      title: it.body.slice(0, 120),
      body: "PMMT で扱いきれず持ち越し",
      unitId: it.unitId,
      cycleId,
      sourceItemId: it.id,
      source: "thread",
    });
  }
  await db.update(cycles).set({ status: "closed" }).where(eq(cycles.id, cycleId));
}

const memberSchema = z.object({
  name: z.string().trim().min(1, "名前を入れてください"),
  email: z.string().trim().toLowerCase(),
  role: z.enum(["lead", "chief", "vice", "viewer"]),
  unitId: z.number().int().optional(),
  slackUserId: z.string().trim().default(""),
});

const scheduleSchema = z.object({
  meetingAt: z.string().min(1, "会議日時を入れてください"),
  deadlineAt: z.string().min(1, "締切を入れてください"),
});

function readSchedule(body: z.infer<typeof scheduleSchema>) {
  const result = validateCycleSchedule(body);
  if ("errors" in result) throw new ValidationError(result.errors);
  return result.schedule;
}

export const actions = {
  createCycle: defineHandler.withValidator({
    body: scheduleSchema.extend({ past: z.boolean().default(false) }),
  })(async (c, { body }) => {
    requireAdmin(c);
    const schedule = readSchedule(body);
    const error = validateCycleCreation(schedule.meetingAt, body.past, new Date());
    if (error) throw new ValidationError({ past: error });
    await db.insert(cycles).values({
      ...schedule,
      status: body.past ? "closed" : "open",
      // 過去の回には通知を送らない
      ...(body.past ? { remind48SentAt: "past", remind24SentAt: "past", deadlineSentAt: "past" } : {}),
    });
  }),

  updateDeadline: defineHandler.withValidator({
    body: scheduleSchema.extend({ id: z.number().int().positive() }),
  })(async (c, { body }) => {
    requireAdmin(c);
    const schedule = readSchedule(body);
    // 締切を動かしたときだけ通知の送信済み状態を戻す
    const deadlineChanged = sql`${cycles.deadlineAt} <> ${schedule.deadlineAt}`;
    const [updated] = await db
      .update(cycles)
      .set({
        ...schedule,
        remind48SentAt: sql`case when ${deadlineChanged} then null else ${cycles.remind48SentAt} end`,
        remind24SentAt: sql`case when ${deadlineChanged} then null else ${cycles.remind24SentAt} end`,
        deadlineSentAt: sql`case when ${deadlineChanged} then null else ${cycles.deadlineSentAt} end`,
      })
      .where(and(eq(cycles.id, body.id), eq(cycles.status, "open")))
      .returning({ id: cycles.id });
    if (!updated) throw new ValidationError({ id: "受付中の回だけ日程を変更できます" });
  }),

  closeCycle: defineHandler.withValidator({ body: z.object({ id: z.number().int() }) })(async (c, { body }) => {
    requireAdmin(c);
    await closeCycle(body.id);
  }),

  addMember: defineHandler.withValidator({ body: memberSchema })(async (c, { body }) => {
    requireAdmin(c);
    if (!isAllowedEmail(body.email)) throw new ValidationError({ email: "xx.x.xxxx.nutfes@gmail.com の形式で入れてください" });
    const [dup] = await db.select().from(members).where(eq(members.email, body.email));
    if (dup) throw new ValidationError({ email: "このアドレスはもう登録されています" });
    await db.insert(members).values({ ...body, unitId: body.unitId || null, slackUserId: body.slackUserId || null });
  }),

  updateMember: defineHandler.withValidator({
    body: memberSchema.omit({ email: true }).extend({
      id: z.number().int().positive(),
      unitId: z.number().int().nonnegative(),
      slackUserId: z.string().trim().regex(/^$|^[UW][A-Z0-9]{6,}$/, "Slack ID は U または W で始まる英大文字・数字で入れてください（7 文字以上）"),
    }),
  })(async (c, { body }) => {
    const me = requireAdmin(c);
    const [member] = await db.select({ id: members.id }).from(members).where(eq(members.id, body.id));
    if (!member) throw new ValidationError({ id: "メンバーが見つかりません" });
    if (body.id === me.id && body.role !== me.role) throw new ValidationError({ role: "自分自身の役割は変更できません" });
    if (body.unitId) {
      const [unit] = await db.select({ id: units.id }).from(units).where(eq(units.id, body.unitId));
      if (!unit) throw new ValidationError({ unitId: "ユニットが見つかりません" });
    }
    await db.update(members).set({
      name: body.name,
      role: body.role,
      unitId: body.unitId || null,
      slackUserId: body.slackUserId || null,
    }).where(eq(members.id, body.id));
  }),

  deleteMember: defineHandler.withValidator({ body: z.object({ id: z.number().int() }) })(async (c, { body }) => {
    const me = requireAdmin(c);
    if (body.id === me.id) throw new ValidationError({ id: "自分自身は削除できません" });
    try {
      await db.delete(members).where(eq(members.id, body.id));
    } catch {
      // 記入・コメントなどが残っている人は外部キーで消せない
      throw new ValidationError({ id: "記入やコメントが残っているメンバーは削除できません" });
    }
  }),

  addUnit: defineHandler.withValidator({
    body: z.object({ name: z.string().trim().min(1, "名前を入れてください"), kind: z.enum(["project", "team", "chief", "vice"]) }),
  })(async (c, { body }) => {
    requireAdmin(c);
    const [{ n }] = await db.select({ n: count() }).from(units);
    await db.insert(units).values({ ...body, sortOrder: n });
  }),
};
