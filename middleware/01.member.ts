import { getCookie } from "hono/cookie";
import { defineMiddleware } from "void";
import { env } from "void/env";
import { DEMO_COOKIE, resolveMember, type Me } from "../lib/server";

declare module "void" {
  interface CloudContextVariables {
    shared: { me: Me | null; demo: boolean; path: string };
  }
}

// ログインしていなくても開ける URL
const PUBLIC_PREFIXES = ["/login", "/api/auth", "/__void", "/assets", "/favicon"];

export default defineMiddleware(async (c, next) => {
  const demo = env.DEMO_MODE;
  const me = await resolveMember({ demo, demoMemberId: getCookie(c, DEMO_COOKIE) });
  const path = new URL(c.req.url).pathname;
  c.set("shared", { me, demo, path });

  const isPublic = PUBLIC_PREFIXES.some((p) => path.startsWith(p)) || /\.[a-z0-9]+$/i.test(path);
  if (!me && !isPublic) return c.redirect("/login");
  await next();
});
