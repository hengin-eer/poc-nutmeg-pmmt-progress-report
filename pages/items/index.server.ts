import { comments, items, reactions, units } from "@schema";
import { defineHandler, type InferProps } from "void";
import { asc, count, db, desc, eq, inArray } from "void/db";
import type { ItemState } from "../../lib/domain";
import { currentCycle, requireMe } from "../../lib/server";

export type Props = InferProps<typeof loader>;

const TABS = ["open", "live", "closed", "all"] as const;
export type Tab = (typeof TABS)[number];

export const loader = defineHandler(async (c) => {
  requireMe(c);
  const tab = (TABS as readonly string[]).includes(c.req.query("tab") ?? "") ? (c.req.query("tab") as Tab) : "open";
  const cycle = await currentCycle();
  if (!cycle) return { tab, cycle: null, list: [], counts: { open: 0, live: 0, closed: 0, all: 0 } };

  const all = await db
    .select({
      id: items.id,
      body: items.body,
      kind: items.kind,
      state: items.state,
      crossBureau: items.crossBureau,
      resolutionNote: items.resolutionNote,
      createdAt: items.createdAt,
      unitName: units.name,
      sortOrder: units.sortOrder,
    })
    .from(items)
    .innerJoin(units, eq(items.unitId, units.id))
    .where(eq(items.cycleId, cycle.id))
    .orderBy(asc(units.sortOrder), desc(items.createdAt));

  const closed: ItemState[] = ["decided", "resolved", "deferred"];
  const pick = (t: Tab) =>
    all.filter((i) => (t === "all" ? true : t === "closed" ? closed.includes(i.state) : i.state === t));
  const list = pick(tab);

  const ids = list.map((i) => i.id);
  const cc = ids.length ? await db.select({ id: comments.itemId, n: count() }).from(comments).where(inArray(comments.itemId, ids)).groupBy(comments.itemId) : [];
  const rc = ids.length ? await db.select({ id: reactions.itemId, n: count() }).from(reactions).where(inArray(reactions.itemId, ids)).groupBy(reactions.itemId) : [];
  const ccm = new Map(cc.map((r) => [r.id, r.n]));
  const rcm = new Map(rc.map((r) => [r.id, r.n]));

  return {
    tab,
    cycle,
    list: list.map((i) => ({ ...i, comments: ccm.get(i.id) ?? 0, reactions: rcm.get(i.id) ?? 0 })),
    counts: { open: pick("open").length, live: pick("live").length, closed: pick("closed").length, all: all.length },
  };
});
