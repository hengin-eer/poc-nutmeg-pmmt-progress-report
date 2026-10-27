// サーバー側の共通処理（Void 依存）。ロジックそのものは lib/domain.ts に置く。
import { cycles, members, units } from "@schema";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUser } from "void/auth";
import { db, desc, eq } from "void/db";
import { isAdminRole, isAllowedEmail, type Role } from "./domain";

export type Me = {
  id: number;
  name: string;
  email: string;
  role: Role;
  unitId: number | null;
  unitName: string | null;
  isAdmin: boolean;
};

export const DEMO_COOKIE = "demo_member_id";

async function loadMember(where: ReturnType<typeof eq>): Promise<Me | null> {
  const [row] = await db
    .select({
      id: members.id,
      name: members.name,
      email: members.email,
      role: members.role,
      unitId: members.unitId,
      unitName: units.name,
    })
    .from(members)
    .leftJoin(units, eq(members.unitId, units.id))
    .where(where)
    .limit(1);
  return row ? { ...row, isAdmin: isAdminRole(row.role) } : null;
}

/**
 * ログインしている人がどのメンバーかを決める。認証方式を変える時はここだけ直す（Design Doc §9）。
 * - デモモード: Cookie に入ったメンバー ID
 * - 通常: Google ログインのメールアドレス → 形式チェック → members に登録されているか
 */
export async function resolveMember(opts: { demo: boolean; demoMemberId?: string }): Promise<Me | null> {
  if (opts.demo && opts.demoMemberId) {
    const id = Number(opts.demoMemberId);
    if (Number.isInteger(id)) return loadMember(eq(members.id, id));
  }
  const user = getUser();
  if (!user?.email || !isAllowedEmail(user.email)) return null;
  return loadMember(eq(members.email, user.email.trim().toLowerCase()));
}

/** loader / action の中でログイン中のメンバーを取り出す */
export function requireMe(c: Context): Me {
  const me = (c.get("shared" as never) as { me: Me | null } | undefined)?.me;
  if (!me) throw new HTTPException(401, { message: "ログインが必要です" });
  return me;
}

export function requireAdmin(c: Context): Me {
  const me = requireMe(c);
  if (!me.isAdmin) throw new HTTPException(403, { message: "局長・副局長だけが使えます" });
  return me;
}

/** 今の回（開いている中で一番新しいもの。なければ一番新しい回） */
export async function currentCycle() {
  const [open] = await db.select().from(cycles).where(eq(cycles.status, "open")).orderBy(desc(cycles.meetingAt)).limit(1);
  if (open) return open;
  const [latest] = await db.select().from(cycles).orderBy(desc(cycles.meetingAt)).limit(1);
  return latest ?? null;
}

export const nowIso = () => new Date().toISOString();

export function bad(message: string): never {
  throw new HTTPException(400, { message });
}

