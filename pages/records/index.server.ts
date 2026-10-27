import { records, units } from "@schema";
import { defineHandler, type InferProps } from "void";
import { and, asc, db, eq } from "void/db";
import { z } from "zod";
import { parseRecordFilter, searchRecords } from "../../lib/records-query";
import { nowIso, requireMe } from "../../lib/server";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const me = requireMe(c);
  const filter = parseRecordFilter((k) => c.req.query(k));
  const list = await searchRecords(filter);
  const unitList = await db.select({ id: units.id, name: units.name }).from(units).orderBy(asc(units.sortOrder));
  return { me, filter, list, unitList };
});

export const actions = {
  /** TODO・先送りした議題を「終わった」にする（自分のユニットのもの、または局長・副局長） */
  toggle: defineHandler.withValidator({ body: z.object({ id: z.number().int(), done: z.boolean() }) })(async (c, { body }) => {
    const me = requireMe(c);
    const where = me.isAdmin ? eq(records.id, body.id) : and(eq(records.id, body.id), eq(records.unitId, me.unitId ?? -1));
    await db.update(records).set({ doneAt: body.done ? nowIso() : null }).where(where);
  }),
};
