import { useForm } from "@void/react";
import { useMemo, useState } from "react";
import { parseMinutes, type RecordKind } from "../../lib/domain";
import { type Props } from "../../pages/admin/import.server";

type Row = { kind: RecordKind; title: string; body: string; unitId: number | null; unitName: string | null; checked: boolean };

export function useMinutesImport({ cycles, units }: Props) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState("");
  const form = useForm("/admin/import", { cycleId: 0, summary: "", saveSummary: true, entries: [] as Omit<Row, "checked" | "unitName">[] });

  const unitByName = useMemo(() => new Map(units.map((u) => [u.name.toLowerCase(), u.id])), [units]);

  const parse = () => {
    const result = parseMinutes(text);
    setSummary(result.summary);
    setRows(
      result.candidates.map((c) => ({
        ...c,
        unitId: c.unitName ? (unitByName.get(c.unitName.toLowerCase()) ?? null) : null,
        checked: true,
      })),
    );
    // 見出しの日付と同じ日の回を自動で選ぶ
    if (result.date) {
      const hit = cycles.find((cy) => formatDateKey(cy.meetingAt) === result.date);
      form.setData("cycleId", hit?.id ?? 0);
    }
  };

  const update = (i: number, patch: Partial<Row>) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const selected = rows.filter((r) => r.checked);

  return { text, setText, rows, summary, setSummary, form, parse, update, selected };
}

export type ImportState = ReturnType<typeof useMinutesImport>;

/** ISO → JST の YYYY-MM-DD */
function formatDateKey(iso: string) {
  return new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
