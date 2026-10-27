import { cycles, items, members, reports, units } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { db, desc, eq } from "void/db";
import { z } from "zod";
import { parseRecordFilter, searchRecords } from "../../lib/records-query";
import { requireMe } from "../../lib/server";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const me = requireMe(c);
  const id = Number(c.req.param("id"));
  const [unit] = await db.select().from(units).where(eq(units.id, id));
  if (!unit) throw new HTTPException(404, { message: "ユニットが見つかりません" });

  const people = await db.select({ name: members.name, role: members.role }).from(members).where(eq(members.unitId, id));
  // 週ごとの更新の履歴（新しい回から）
  const history = await db
    .select({
      cycleId: cycles.id,
      meetingAt: cycles.meetingAt,
      progress: reports.progress,
      busyness: reports.busyness,
      done: reports.done,
      next: reports.next,
      submittedAt: reports.submittedAt,
    })
    .from(reports)
    .innerJoin(cycles, eq(reports.cycleId, cycles.id))
    .where(eq(reports.unitId, id))
    .orderBy(desc(cycles.meetingAt));
  const unitItems = await db
    .select({ id: items.id, cycleId: items.cycleId, body: items.body, kind: items.kind, state: items.state, crossBureau: items.crossBureau })
    .from(items)
    .where(eq(items.unitId, id));
  const unitRecords = await searchRecords({ ...parseRecordFilter(() => undefined), unitId: id });

  return {
    unit,
    people,
    history: history.filter((h) => h.submittedAt).map((h) => ({ ...h, items: unitItems.filter((i) => i.cycleId === h.cycleId) })),
    records: unitRecords,
    canEdit: me.isAdmin || me.unitId === id,
  };
});

export const action = defineHandler.withValidator({
  body: z.object({ purpose: z.string().trim().max(500), summary: z.string().trim().max(2000) }),
})(async (c, { body }) => {
  const me = requireMe(c);
  const id = Number(c.req.param("id"));
  if (!(me.isAdmin || me.unitId === id)) throw new HTTPException(403, { message: "編集できるのは、そのユニットの人と局長・副局長だけです" });
  await db.update(units).set(body).where(eq(units.id, id));
});
