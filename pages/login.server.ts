import { members, units } from "@schema";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { asc, db, eq } from "void/db";
import { env } from "void/env";
import { z } from "zod";
import { DEMO_COOKIE } from "../lib/server";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const shared = c.get("shared");
  if (shared?.me) return c.redirect("/");
  const demo = env.DEMO_MODE;
  // デモモードの時だけ、メンバーを選んでログインできるように一覧を返す
  const demoMembers = demo
    ? await db
        .select({ id: members.id, name: members.name, unitName: units.name })
        .from(members)
        .leftJoin(units, eq(members.unitId, units.id))
        .orderBy(asc(units.sortOrder))
    : [];
  return { demo, demoMembers, googleReady: Boolean(env.AUTH_GOOGLE_CLIENT_ID) };
});

export const actions = {
  login: defineHandler.withValidator({
    body: z.object({ memberId: z.number().int() }),
  })(async (c, { body }) => {
    if (!env.DEMO_MODE) throw new HTTPException(404);
    setCookie(c, DEMO_COOKIE, String(body.memberId), { path: "/", httpOnly: true, sameSite: "Lax", maxAge: 60 * 60 * 24 * 30 });
    return c.redirect("/");
  }),
  logout: defineHandler(async (c) => {
    deleteCookie(c, DEMO_COOKIE, { path: "/" });
    return c.redirect("/login");
  }),
};
