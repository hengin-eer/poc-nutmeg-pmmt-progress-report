import { HTTPException } from "hono/http-exception";
import { defineHandler } from "void";
import { ITEM_STATE_LABEL, type ItemState } from "../../../lib/domain";
import { addComment, closeItem, FieldError, loadThread, toggleReaction } from "../../../lib/items";
import { requireMe } from "../../../lib/server";

// スレッドをページ遷移なしで開くパネル（components/thread.tsx）用の JSON API

export const GET = defineHandler(async (c) => {
  const me = requireMe(c);
  return c.json(await loadThread(Number(c.req.param("id")), me));
});

type Body = { op?: string; body?: string; emoji?: string; state?: string; note?: string };

export const POST = defineHandler(async (c) => {
  const me = requireMe(c);
  // 別サイトのフォームから送らせないため、JSON だけ受け付ける
  if (!c.req.header("content-type")?.includes("application/json")) throw new HTTPException(415, { message: "JSON で送ってください" });
  const id = Number(c.req.param("id"));
  const body = (await c.req.json().catch(() => ({}))) as Body;
  try {
    if (body.op === "comment") await addComment(id, me, String(body.body ?? ""));
    else if (body.op === "react") await toggleReaction(id, me, String(body.emoji ?? ""));
    else if (body.op === "close") {
      if (!(String(body.state) in ITEM_STATE_LABEL)) throw new FieldError({ state: "状態を選んでください" });
      await closeItem(id, me, body.state as ItemState, String(body.note ?? ""));
    } else throw new HTTPException(400, { message: "不明な操作です" });
  } catch (e) {
    if (e instanceof FieldError) return c.json({ ok: false, errors: e.errors }, 422);
    throw e;
  }
  return c.json({ ok: true, data: await loadThread(id, me) });
});
