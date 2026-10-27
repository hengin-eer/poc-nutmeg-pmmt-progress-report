// 記録の検索（画面と Markdown 書き出しで共通）
import { cycles, records, units } from "@schema";
import { and, db, desc, eq, inArray, isNotNull, isNull, like, or } from "void/db";
import type { RecordKind } from "./domain";

export type RecordFilter = {
  q: string;
  kind: RecordKind | "";
  unitId: number | null;
  status: "pending" | "done" | "";
};

export function parseRecordFilter(query: (key: string) => string | undefined): RecordFilter {
  const kind = query("kind") ?? "";
  const status = query("status") ?? "";
  const unit = Number(query("unit"));
  return {
    q: (query("q") ?? "").trim(),
    kind: (["decision", "todo", "carryover"].includes(kind) ? kind : "") as RecordFilter["kind"],
    unitId: Number.isInteger(unit) && unit > 0 ? unit : null,
    status: (["pending", "done"].includes(status) ? status : "") as RecordFilter["status"],
  };
}

export async function searchRecords(f: RecordFilter) {
  const conds: Parameters<typeof and> = [];
  if (f.q) {
    const pat = `%${f.q}%`;
    conds.push(or(like(records.title, pat), like(records.body, pat)));
  }
  if (f.kind) conds.push(eq(records.kind, f.kind));
  if (f.unitId) conds.push(eq(records.unitId, f.unitId));
  // 「持ち越し中」= 終わっていない TODO・先送りした議題
  if (f.status === "pending") conds.push(and(inArray(records.kind, ["todo", "carryover"]), isNull(records.doneAt)));
  if (f.status === "done") conds.push(isNotNull(records.doneAt));

  return db
    .select({
      id: records.id,
      kind: records.kind,
      title: records.title,
      body: records.body,
      source: records.source,
      sourceItemId: records.sourceItemId,
      doneAt: records.doneAt,
      unitId: records.unitId,
      unitName: units.name,
      meetingAt: cycles.meetingAt,
    })
    .from(records)
    .innerJoin(cycles, eq(records.cycleId, cycles.id))
    .leftJoin(units, eq(records.unitId, units.id))
    .where(and(...conds))
    .orderBy(desc(cycles.meetingAt), desc(records.id));
}
