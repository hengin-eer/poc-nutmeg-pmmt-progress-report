import { cycles, records, units } from "@schema";
import { defineHandler, type InferProps } from "void";
import { asc, db, desc, eq } from "void/db";
import { ValidationError } from "void/handler";
import { z } from "zod";
import { requireAdmin } from "../../lib/server";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  requireAdmin(c);
  return {
    cycles: await db.select({ id: cycles.id, meetingAt: cycles.meetingAt, status: cycles.status }).from(cycles).orderBy(desc(cycles.meetingAt)),
    units: await db.select({ id: units.id, name: units.name }).from(units).orderBy(asc(units.sortOrder)),
  };
});

/** 議事録の候補のうち、✓ をつけたものだけ記録に登録する（Design Doc §7-5） */
export const action = defineHandler.withValidator({
  body: z.object({
    cycleId: z.number().int().min(1, "どの回の議事録か選んでください"),
    summary: z.string().default(""),
    saveSummary: z.boolean().default(true),
    entries: z
      .array(
        z.object({
          kind: z.enum(["decision", "todo", "carryover"]),
          title: z.string().trim().min(1),
          body: z.string().default(""),
          unitId: z.number().int().nullable(),
        }),
      )
      .min(1, "登録するものを 1 つ以上選んでください"),
  }),
})(async (c, { body }) => {
  requireAdmin(c);
  const [cycle] = await db.select().from(cycles).where(eq(cycles.id, body.cycleId));
  if (!cycle) throw new ValidationError({ cycleId: "回が見つかりません" });
  await db.insert(records).values(body.entries.map((e) => ({ ...e, cycleId: cycle.id, source: "minutes" as const })));
  if (body.saveSummary && body.summary.trim()) {
    await db.update(cycles).set({ minutesSummary: body.summary.trim() }).where(eq(cycles.id, cycle.id));
  }
  return c.redirect(`/records`);
});
