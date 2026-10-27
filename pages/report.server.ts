import { comments, items, records, reports, units } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { and, asc, count, db, eq, inArray, isNull } from "void/db";
import { ValidationError } from "void/handler";
import { z } from "zod";
import { currentCycle, nowIso, requireMe } from "../lib/server";

export type Props = InferProps<typeof loader>;

async function context(c: Parameters<typeof requireMe>[0]) {
  const me = requireMe(c);
  if (!me.unitId) throw new HTTPException(403, { message: "報告ユニットに所属していません" });
  const cycle = await currentCycle();
  if (!cycle) throw new HTTPException(404, { message: "回がまだ作られていません" });
  return { me, unitId: me.unitId, cycle };
}

export const loader = defineHandler(async (c) => {
  const { me, unitId, cycle } = await context(c);
  const [unit] = await db.select().from(units).where(eq(units.id, unitId));
  const [report] = await db.select().from(reports).where(and(eq(reports.cycleId, cycle.id), eq(reports.unitId, unitId)));
  const myItems = await db
    .select()
    .from(items)
    .where(and(eq(items.cycleId, cycle.id), eq(items.unitId, unitId)))
    .orderBy(asc(items.createdAt));
  const ids = myItems.map((i) => i.id);
  const cc = ids.length
    ? await db.select({ id: comments.itemId, n: count() }).from(comments).where(inArray(comments.itemId, ids)).groupBy(comments.itemId)
    : [];
  const ccm = new Map(cc.map((r) => [r.id, r.n]));
  // 自分のユニットの、終わっていない TODO・先送りした議題（前の回から持ち越し）
  const pending = await db
    .select()
    .from(records)
    .where(and(eq(records.unitId, unitId), inArray(records.kind, ["todo", "carryover"]), isNull(records.doneAt)))
    .orderBy(asc(records.createdAt));
  return { me, unit, cycle, report: report ?? null, myItems: myItems.map((i) => ({ ...i, comments: ccm.get(i.id) ?? 0 })), pending, now: nowIso() };
});

const saveSchema = z.object({
  progress: z.enum(["green", "yellow", "red", ""]).default(""),
  busyness: z.number().int().min(0).max(3).default(0),
  done: z.string().max(4000).default(""),
  next: z.string().max(4000).default(""),
  submit: z.boolean().default(false),
});

const itemSchema = z.object({
  kind: z.enum(["confirm", "talk"]),
  body: z.string().trim().min(1, "内容を書いてください").max(2000),
  crossBureau: z.boolean().default(false),
});

export const actions = {
  /** 下書き保存 / 提出 */
  save: defineHandler.withValidator({ body: saveSchema })(async (c, { body }) => {
    const { me, unitId, cycle } = await context(c);
    if (cycle.status !== "open") throw new ValidationError({ done: "この回は終了しています" });
    if (body.submit) {
      const errors: Record<string, string> = {};
      if (!body.busyness) errors.busyness = "忙しさを選んでください";
      if (!body.done.trim()) errors.done = "今週やったことを書いてください";
      if (Object.keys(errors).length) throw new ValidationError(errors);
    }
    const values = {
      progress: body.progress || null,
      busyness: body.busyness || null,
      done: body.done,
      next: body.next,
      authorId: me.id,
      updatedAt: nowIso(),
    };
    const [existing] = await db.select().from(reports).where(and(eq(reports.cycleId, cycle.id), eq(reports.unitId, unitId)));
    const submittedAt = body.submit ? (existing?.submittedAt ?? nowIso()) : (existing?.submittedAt ?? null);
    if (existing) {
      await db.update(reports).set({ ...values, submittedAt }).where(eq(reports.id, existing.id));
    } else {
      await db.insert(reports).values({ ...values, cycleId: cycle.id, unitId, submittedAt });
    }
  }),

  addItem: defineHandler.withValidator({ body: itemSchema })(async (c, { body }) => {
    const { me, unitId, cycle } = await context(c);
    await db.insert(items).values({ ...body, cycleId: cycle.id, unitId, authorId: me.id });
  }),

  deleteItem: defineHandler.withValidator({ body: z.object({ id: z.number().int() }) })(async (c, { body }) => {
    const { unitId } = await context(c);
    // 自分のユニットの、まだ誰も閉じていないものだけ消せる
    await db.delete(items).where(and(eq(items.id, body.id), eq(items.unitId, unitId), eq(items.state, "open")));
  }),

  toggleRecord: defineHandler.withValidator({ body: z.object({ id: z.number().int(), done: z.boolean() }) })(
    async (c, { body }) => {
      const { unitId } = await context(c);
      await db
        .update(records)
        .set({ doneAt: body.done ? nowIso() : null })
        .where(and(eq(records.id, body.id), eq(records.unitId, unitId)));
    },
  ),
};
