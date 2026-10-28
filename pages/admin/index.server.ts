import { cycles, items, members, records, reports, units } from "@schema";
import { defineHandler, type InferProps } from "void";
import { and, asc, count, db, desc, eq, isNotNull } from "void/db";
import { ValidationError } from "void/handler";
import { z } from "zod";
import { defaultSchedule, fromJstInput, isAllowedEmail } from "../../lib/domain";
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
  const next = defaultSchedule(new Date());
  return {
    cycles: cycleList.map((cy) => ({ ...cy, submitted: submitted.find((s) => s.cycleId === cy.id)?.n ?? 0 })),
    units: unitList,
    members: memberList,
    defaults: { meetingAt: next.meetingAt.toISOString(), deadlineAt: next.deadlineAt.toISOString() },
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

export const actions = {
  /** 新しい回を作る。過去の日付なら「閉じた回」として作る（過去の議事録の取り込み用） */
  createCycle: defineHandler.withValidator({
    body: z.object({ meetingAt: z.string().min(1, "日時を入れてください"), deadlineAt: z.string().min(1, "日時を入れてください") }),
  })(async (c, { body }) => {
    requireAdmin(c);
    const meetingAt = fromJstInput(body.meetingAt);
    const deadlineAt = fromJstInput(body.deadlineAt);
    if (deadlineAt > meetingAt) throw new ValidationError({ deadlineAt: "締切は PMMT より前にしてください" });
    const isPast = new Date(meetingAt) < new Date();
    if (!isPast) {
      // 開いている回は 1 つだけにする
      for (const open of await db.select().from(cycles).where(eq(cycles.status, "open"))) await closeCycle(open.id);
    }
    await db.insert(cycles).values({
      meetingAt,
      deadlineAt,
      status: isPast ? "closed" : "open",
      // 過去の回には通知を送らない
      ...(isPast ? { remind48SentAt: "past", remind24SentAt: "past", deadlineSentAt: "past" } : {}),
    });
  }),

  updateDeadline: defineHandler.withValidator({
    body: z.object({ id: z.number().int(), deadlineAt: z.string().min(1) }),
  })(async (c, { body }) => {
    requireAdmin(c);
    // 締切を動かしたら、リマインドを送り直せるようにする
    await db
      .update(cycles)
      .set({ deadlineAt: fromJstInput(body.deadlineAt), remind48SentAt: null, remind24SentAt: null, deadlineSentAt: null })
      .where(eq(cycles.id, body.id));
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
