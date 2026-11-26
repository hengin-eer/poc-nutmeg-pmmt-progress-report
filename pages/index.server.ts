import { comments, items, reactions, records, reports, units } from "@schema";
import { defineHandler, type InferProps } from "void";
import { and, asc, count, db, desc, eq, inArray, isNull } from "void/db";
import { isAfterDeadline } from "../lib/domain";
import { loadCycleSelection, requireMe } from "../lib/server";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const me = requireMe(c);
  const { cycle, cycleOptions } = await loadCycleSelection(c.req.query("cycle"));
  const unitList = await db.select().from(units).orderBy(asc(units.sortOrder));
  if (!cycle) return { me, cycle: null, cycleOptions, cards: [], liveItems: [], openItems: [], pending: [], now: new Date().toISOString() };

  const reportList = await db.select().from(reports).where(eq(reports.cycleId, cycle.id));
  const itemList = await db.select().from(items).where(eq(items.cycleId, cycle.id)).orderBy(desc(items.createdAt));
  const ids = itemList.map((i) => i.id);
  const commentCounts = ids.length
    ? await db.select({ itemId: comments.itemId, n: count() }).from(comments).where(inArray(comments.itemId, ids)).groupBy(comments.itemId)
    : [];
  const reactionCounts = ids.length
    ? await db.select({ itemId: reactions.itemId, n: count() }).from(reactions).where(inArray(reactions.itemId, ids)).groupBy(reactions.itemId)
    : [];
  const cc = new Map(commentCounts.map((r) => [r.itemId, r.n]));
  const rc = new Map(reactionCounts.map((r) => [r.itemId, r.n]));
  const unitName = new Map(unitList.map((u) => [u.id, u.name]));

  const cards = unitList.map((u) => {
    const r = reportList.find((x) => x.unitId === u.id);
    const mine = itemList.filter((i) => i.unitId === u.id);
    return {
      id: u.id,
      name: u.name,
      kind: u.kind,
      submitted: Boolean(r?.submittedAt),
      late: isAfterDeadline(r?.submittedAt, cycle.deadlineAt),
      progress: r?.progress ?? null,
      busyness: r?.busyness ?? null,
      excerpt: r?.done ?? "",
      openCount: mine.filter((i) => i.state === "open").length,
      crossCount: mine.filter((i) => i.crossBureau && (i.state === "open" || i.state === "live")).length,
    };
  });

  const toView = (i: (typeof itemList)[number]) => ({
    id: i.id,
    body: i.body,
    late: isAfterDeadline(i.createdAt, cycle.deadlineAt),
    kind: i.kind,
    state: i.state,
    crossBureau: i.crossBureau,
    unitName: unitName.get(i.unitId) ?? "",
    comments: cc.get(i.id) ?? 0,
    reactions: rc.get(i.id) ?? 0,
  });

  // 終わっていない TODO と先送りした議題（前の回から持ち越されているもの）
  const pending = await db
    .select({ id: records.id, kind: records.kind, title: records.title, unitName: units.name })
    .from(records)
    .leftJoin(units, eq(records.unitId, units.id))
    .where(and(inArray(records.kind, ["todo", "carryover"]), isNull(records.doneAt)))
    .orderBy(asc(records.createdAt));

  return {
    me,
    cycle,
    cycleOptions,
    cards,
    liveItems: itemList.filter((i) => i.state === "live").map(toView),
    openItems: itemList.filter((i) => i.state === "open" && i.kind === "confirm").map(toView),
    pending,
    now: new Date().toISOString(),
  };
});
