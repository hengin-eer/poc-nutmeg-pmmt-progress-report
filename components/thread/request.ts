import type { ThreadData } from "../../lib/items";

export type Result = { ok: true; data: ThreadData } | { ok: false; errors: Record<string, string> };

export async function post(id: number, payload: Record<string, unknown>): Promise<Result> {
  const r = await fetch(`/api/items/${id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (r.ok || r.status === 422) return r.json();
  return { ok: false, errors: { _: "保存できませんでした。もう一度試してください" } };
}
