import { defineHandler, type InferProps } from "void";
import { loadThread } from "../../lib/items";
import { requireMe } from "../../lib/server";

// 全画面のスレッド（Slack の通知リンクなどから開く）。操作は routes/api/items/[id].ts
export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const me = requireMe(c);
  const data = await loadThread(Number(c.req.param("id")), me);
  return { data, cycleOpen: data.cycle.status === "open" };
});
