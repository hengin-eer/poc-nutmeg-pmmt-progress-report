import { ITEM_KINDS, isAfterDeadline } from "../lib/domain";
import { comments, cycles, items, records, reports, units } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { and, asc, count, db, eq, exists, inArray, isNull, sql } from "void/db";
import { ValidationError } from "void/handler";
import { z } from "zod";
import { loadCycleSelection, nowIso, requireMe } from "../lib/server";

export type Props = InferProps<typeof loader>;

function requireUnit(c: Parameters<typeof requireMe>[0]) {
  const me = requireMe(c);
  if (!me.unitId) throw new HTTPException(403, { message: "報告ユニットに所属していません" });
  return { me, unitId: me.unitId };
}

export const loader = defineHandler(async (c) => {
  const { me, unitId } = requireUnit(c);
  const { cycle, cycleOptions } = await loadCycleSelection(c.req.query("cycle"));
  if (!cycle) throw new HTTPException(404, { message: "回がまだ作られていません" });
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
  return { me, unit, cycle, cycleOptions, report: report ?? null, myItems: myItems.map((i) => ({ ...i, late: isAfterDeadline(i.createdAt, cycle.deadlineAt), comments: ccm.get(i.id) ?? 0 })), pending, now: nowIso() };
});

const cycleIdSchema = z.number().int().positive();

const saveSchema = z.object({
  cycleId: cycleIdSchema,
  progress: z.enum(["green", "yellow", "red", ""]).default(""),
  busyness: z.number().int().min(0).max(3).default(0),
  done: z.string().max(4000).default(""),
  next: z.string().max(4000).default(""),
  submit: z.boolean().default(false),
});

const itemSchema = z.object({
  cycleId: cycleIdSchema,
  kind: z.enum(ITEM_KINDS),
  body: z.string().trim().min(1, "内容を書いてください").max(2000),
  crossBureau: z.boolean().default(false),
});

function openCycle(cycleId: number) {
  return and(eq(cycles.id, cycleId), eq(cycles.status, "open"));
}

function rejectClosedCycle(): never {
  throw new ValidationError({ cycleId: "受付中の回だけ書き込めます。この回は終了したか、見つかりません" });
}

export const actions = {
  /** 下書き保存 / 提出 */
  save: defineHandler.withValidator({ body: saveSchema })(async (c, { body }) => {
    const { me, unitId } = requireUnit(c);
    if (body.submit) {
      const errors: Record<string, string> = {};
      if (!body.busyness) errors.busyness = "忙しさを選んでください";
      if (!body.done.trim()) errors.done = "今週やったことを書いてください";
      if (Object.keys(errors).length) throw new ValidationError(errors);
    }
    const now = nowIso();
    // 受付状態の確認と書き込みを同じ文で行い、初回提出の時刻を保持する。
    const result = await db.run(sql`
      insert into ${reports} (cycle_id, unit_id, author_id, progress, busyness, done, next, submitted_at, updated_at)
      select ${cycles.id}, ${unitId}, ${me.id}, ${body.progress || null}, ${body.busyness || null},
        ${body.done}, ${body.next}, ${body.submit ? now : null}, ${now}
      from ${cycles} where ${openCycle(body.cycleId)}
      on conflict (cycle_id, unit_id) do update set
        author_id = excluded.author_id, progress = excluded.progress, busyness = excluded.busyness,
        done = excluded.done, next = excluded.next, updated_at = excluded.updated_at,
        submitted_at = coalesce(${reports.submittedAt}, excluded.submitted_at)
    `);
    if (!result.meta.changes) rejectClosedCycle();
    return c.redirect(`/report?cycle=${body.cycleId}`);
  }),

  addItem: defineHandler.withValidator({ body: itemSchema })(async (c, { body }) => {
    const { me, unitId } = requireUnit(c);
    const result = await db.run(sql`
      insert into ${items} (cycle_id, unit_id, author_id, kind, body, cross_bureau)
      select ${cycles.id}, ${unitId}, ${me.id}, ${body.kind}, ${body.body}, ${Number(body.crossBureau)}
      from ${cycles} where ${openCycle(body.cycleId)}
    `);
    if (!result.meta.changes) rejectClosedCycle();
    return c.redirect(`/report?cycle=${body.cycleId}`);
  }),

  deleteItem: defineHandler.withValidator({ body: z.object({ id: z.number().int(), cycleId: cycleIdSchema }) })(async (c, { body }) => {
    const { unitId } = requireUnit(c);
    const open = db.select({ id: cycles.id }).from(cycles).where(openCycle(body.cycleId));
    // 自分のユニットの、まだ誰も閉じていないものだけ消せる
    const [[cycle]] = await db.batch([
      open,
      db.delete(items).where(and(eq(items.id, body.id), eq(items.unitId, unitId), eq(items.cycleId, body.cycleId), eq(items.state, "open"), exists(open))),
    ]);
    if (!cycle) rejectClosedCycle();
    return c.redirect(`/report?cycle=${body.cycleId}`);
  }),

  toggleRecord: defineHandler.withValidator({ body: z.object({ id: z.number().int(), done: z.boolean(), cycleId: cycleIdSchema }) })(
    async (c, { body }) => {
      const { unitId } = requireUnit(c);
      await db
        .update(records)
        .set({ doneAt: body.done ? nowIso() : null })
        .where(and(eq(records.id, body.id), eq(records.unitId, unitId)));
      return c.redirect(`/report?cycle=${body.cycleId}`);
    },
  ),
};
