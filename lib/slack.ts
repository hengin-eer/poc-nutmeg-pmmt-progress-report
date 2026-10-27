import { env } from "void/env";

/** PMMT 用チャンネルに投稿する。Webhook が未設定ならログに出すだけ（ローカル開発用） */
export async function postToSlack(text: string): Promise<void> {
  const url = env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.log(`[slack:dry-run]\n${text}`);
    return;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) console.error(`[slack] 送信に失敗: ${res.status} ${await res.text()}`);
}

/** Slack のメンション（ユーザー ID があれば <@U…>、なければ名前） */
export const mention = (m: { name: string; slackUserId: string | null }) => (m.slackUserId ? `<@${m.slackUserId}>` : m.name);
