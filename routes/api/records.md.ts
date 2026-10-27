import { defineHandler } from "void";
import { recordsToMarkdown } from "../../lib/domain";
import { parseRecordFilter, searchRecords } from "../../lib/records-query";
import { requireMe } from "../../lib/server";

// 記録を Markdown で書き出す（NUTMEG 便りの下書きや、AI に渡す材料に）
export const GET = defineHandler(async (c) => {
  requireMe(c);
  const list = await searchRecords(parseRecordFilter((k) => c.req.query(k)));
  return c.text(recordsToMarkdown(list), 200, { "content-type": "text/markdown; charset=utf-8" });
});
