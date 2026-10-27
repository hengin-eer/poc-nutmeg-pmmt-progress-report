import { comments, cycles, items, members, reactions, records, units } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { and, asc, db, eq } from "void/db";
import { ValidationError } from "void/handler";
import { env } from "void/env";
import { z } from "zod";
import { nextStates, recordKindFor, REACTIONS, type ItemState } from "../../lib/domain";
import { nowIso, requireMe } from "../../lib/server";
import { mention, postToSlack } from "../../lib/slack";

export type Props = InferProps<typeof loader>;

async function findItem(id: number) {
  const [row] = await db.select().from(items).where(eq(items.id, id));
  if (!row) throw new HTTPException(404, { message: "確認事項が見つかりません" });
  return row;
}

export const loader = defineHandler(async (c) => {
  const me = requireMe(c);
  const item = await findItem(Number(c.req.param("id")));
  const [unit] = await db.select().from(units).where(eq(units.id, item.unitId));
  const [cycle] = await db.select().from(cycles).where(eq(cycles.id, item.cycleId));
  const [author] = item.authorId ? await db.select({ name: members.name }).from(members).where(eq(members.id, item.authorId)) : [];
  const [closedBy] = item.closedById ? await db.select({ name: members.name }).from(members).where(eq(members.id, item.closedById)) : [];
  const thread = await db
    .select({ id: comments.id, body: comments.body, createdAt: comments.createdAt, author: members.name })
    .from(comments)
    .innerJoin(members, eq(comments.authorId, members.id))
    .where(eq(comments.itemId, item.id))
    .orderBy(asc(comments.createdAt));
  const reactionRows = await db
    .select({ emoji: reactions.emoji, memberId: reactions.memberId, name: members.name })
    .from(reactions)
    .innerJoin(members, eq(reactions.memberId, members.id))
    .where(eq(reactions.itemId, item.id));
  const reactionSummary = REACTIONS.map((emoji) => {
    const who = reactionRows.filter((r) => r.emoji === emoji);
    return { emoji, count: who.length, mine: who.some((r) => r.memberId === me.id), names: who.map((r) => r.name) };
  });

  return {
    item,
    unit,
    cycle,
    authorName: author?.name ?? null,
    closedByName: closedBy?.name ?? null,
    thread,
    reactionSummary,
    canClose: me.isAdmin || item.authorId === me.id || item.unitId === me.unitId,
    nextStates: nextStates(item.state),
  };
});

export const actions = {
  comment: defineHandler.withValidator({ body: z.object({ body: z.string().trim().min(1, "コメントを書いてください").max(2000) }) })(
    async (c, { body }) => {
      const me = requireMe(c);
      const item = await findItem(Number(c.req.param("id")));
      await db.insert(comments).values({ itemId: item.id, authorId: me.id, body: body.body });
      // 書いた人に Slack で知らせる（自分のコメントは除く）
      if (item.authorId && item.authorId !== me.id) {
        const [author] = await db.select().from(members).where(eq(members.id, item.authorId));
        if (author) {
          await postToSlack(
            `:speech_balloon: ${mention(author)} 確認事項に ${me.name} さんがコメントしました\n> ${item.body.slice(0, 80)}\n${env.APP_URL}/items/${item.id}`,
          );
        }
      }
    },
  ),

  react: defineHandler.withValidator({ body: z.object({ emoji: z.enum(REACTIONS) }) })(async (c, { body }) => {
    const me = requireMe(c);
    const item = await findItem(Number(c.req.param("id")));
    const where = and(eq(reactions.itemId, item.id), eq(reactions.memberId, me.id), eq(reactions.emoji, body.emoji));
    const [existing] = await db.select().from(reactions).where(where);
    if (existing) await db.delete(reactions).where(eq(reactions.id, existing.id));
    else await db.insert(reactions).values({ itemId: item.id, memberId: me.id, emoji: body.emoji });
  }),

  /** 決定 / 当日に話す / 解決済み / 先送り で閉じる（または開き直す） */
  close: defineHandler.withValidator({
    body: z.object({
      state: z.enum(["open", "decided", "live", "resolved", "deferred"]),
      note: z.string().trim().max(1000).default(""),
    }),
  })(async (c, { body }) => {
    const me = requireMe(c);
    const item = await findItem(Number(c.req.param("id")));
    if (!(me.isAdmin || item.authorId === me.id || item.unitId === me.unitId)) {
      throw new HTTPException(403, { message: "閉じられるのは、書いた人・局長・副局長だけです" });
    }
    const to = body.state as ItemState;
    if (!nextStates(item.state).includes(to)) throw new ValidationError({ state: "この状態には変更できません" });
    const kind = recordKindFor(to);
    if (kind === "decision" && !body.note) throw new ValidationError({ note: "決まった内容を一言で書いてください" });

    const closing = to !== "open" && to !== "live";
    await db
      .update(items)
      .set({
        state: to,
        resolutionNote: body.note,
        closedById: closing ? me.id : null,
        closedAt: closing ? nowIso() : null,
      })
      .where(eq(items.id, item.id));

    // 開き直した時は、このスレッドから自動で作った記録を消す
    if (to === "open") {
      await db.delete(records).where(and(eq(records.sourceItemId, item.id), eq(records.source, "thread")));
    }
    // 決定 → 「決まったこと」、先送り → 「先送りした議題」を記録に残す
    if (kind) {
      await db.insert(records).values({
        kind,
        title: kind === "decision" ? body.note : item.body.slice(0, 120),
        body: kind === "decision" ? item.body : body.note,
        unitId: item.unitId,
        cycleId: item.cycleId,
        sourceItemId: item.id,
        source: "thread",
      });
    }
  }),
};
