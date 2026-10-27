// 確認事項のスレッド（読み込み・コメント・リアクション・閉じる）。
// 全画面のページと、ページ遷移なしで開くパネルの両方から使う。
import { comments, cycles, items, members, reactions, records, units } from "@schema";
import { HTTPException } from "hono/http-exception";
import { and, asc, db, eq } from "void/db";
import { env } from "void/env";
import { nextStates, recordKindFor, REACTIONS, type ItemState } from "./domain";
import { nowIso, type Me } from "./server";
import { mention, postToSlack } from "./slack";

export class FieldError extends Error {
  constructor(public errors: Record<string, string>) {
    super(Object.values(errors)[0]);
  }
}

async function findItem(id: number) {
  const [row] = Number.isInteger(id) ? await db.select().from(items).where(eq(items.id, id)) : [];
  if (!row) throw new HTTPException(404, { message: "確認事項が見つかりません" });
  return row;
}

const canClose = (me: Me, item: { authorId: number | null; unitId: number }) =>
  me.isAdmin || item.authorId === me.id || item.unitId === me.unitId;

export async function loadThread(id: number, me: Me) {
  const item = await findItem(id);
  const [unit] = await db.select({ id: units.id, name: units.name }).from(units).where(eq(units.id, item.unitId));
  const [cycle] = await db.select({ id: cycles.id, meetingAt: cycles.meetingAt, status: cycles.status }).from(cycles).where(eq(cycles.id, item.cycleId));
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
    item: {
      id: item.id,
      kind: item.kind,
      body: item.body,
      state: item.state,
      crossBureau: item.crossBureau,
      resolutionNote: item.resolutionNote,
      createdAt: item.createdAt,
    },
    unit,
    cycle,
    authorName: author?.name ?? null,
    closedByName: closedBy?.name ?? null,
    thread,
    reactionSummary,
    isMine: item.unitId === me.unitId,
    canClose: canClose(me, item),
    nextStates: nextStates(item.state),
  };
}

export type ThreadData = Awaited<ReturnType<typeof loadThread>>;

export async function addComment(id: number, me: Me, body: string) {
  const text = body.trim();
  if (!text) throw new FieldError({ body: "コメントを書いてください" });
  if (text.length > 2000) throw new FieldError({ body: "2000 文字までです" });
  const item = await findItem(id);
  await db.insert(comments).values({ itemId: item.id, authorId: me.id, body: text });
  // 書いた人に Slack で知らせる（自分のコメントは除く）
  if (item.authorId && item.authorId !== me.id) {
    const [author] = await db.select().from(members).where(eq(members.id, item.authorId));
    if (author) {
      await postToSlack(
        `:speech_balloon: ${mention(author)} 確認事項に ${me.name} さんがコメントしました\n> ${item.body.slice(0, 80)}\n${env.APP_URL}/items/${item.id}`,
      );
    }
  }
}

export async function toggleReaction(id: number, me: Me, emoji: string) {
  if (!(REACTIONS as readonly string[]).includes(emoji)) throw new FieldError({ emoji: "このリアクションは使えません" });
  const item = await findItem(id);
  const where = and(eq(reactions.itemId, item.id), eq(reactions.memberId, me.id), eq(reactions.emoji, emoji));
  const [existing] = await db.select().from(reactions).where(where);
  if (existing) await db.delete(reactions).where(eq(reactions.id, existing.id));
  else await db.insert(reactions).values({ itemId: item.id, memberId: me.id, emoji });
}

/** 決定 / 当日に話す / 解決済み / 先送り で閉じる（または開き直す） */
export async function closeItem(id: number, me: Me, to: ItemState, rawNote: string) {
  const item = await findItem(id);
  if (!canClose(me, item)) throw new HTTPException(403, { message: "閉じられるのは、書いた人・局長・副局長だけです" });
  if (!nextStates(item.state).includes(to)) throw new FieldError({ state: "この状態には変更できません" });
  const note = rawNote.trim().slice(0, 1000);
  const kind = recordKindFor(to);
  if (kind === "decision" && !note) throw new FieldError({ note: "決まった内容を一言で書いてください" });

  const closing = to !== "open" && to !== "live";
  await db
    .update(items)
    .set({ state: to, resolutionNote: note, closedById: closing ? me.id : null, closedAt: closing ? nowIso() : null })
    .where(eq(items.id, item.id));

  // 開き直した時は、このスレッドから自動で作った記録を消す
  if (to === "open") {
    await db.delete(records).where(and(eq(records.sourceItemId, item.id), eq(records.source, "thread")));
  }
  // 決定 → 「決まったこと」、先送り → 「先送りした議題」を記録に残す
  if (kind) {
    await db.insert(records).values({
      kind,
      title: kind === "decision" ? note : item.body.slice(0, 120),
      body: kind === "decision" ? item.body : note,
      unitId: item.unitId,
      cycleId: item.cycleId,
      sourceItemId: item.id,
      source: "thread",
    });
  }
}
