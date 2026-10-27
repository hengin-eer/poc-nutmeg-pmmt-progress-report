import { Form, Link, useForm } from "@void/react";
import { useMemo, useState } from "react";
import { RecordPill } from "../../components/ui";
import { formatJst, parseMinutes, type RecordKind } from "../../lib/domain";
import type { Props } from "./import.server";

type Row = { kind: RecordKind; title: string; body: string; unitId: number | null; unitName: string | null; checked: boolean };

const SAMPLE = `# PMMT 2026-10-26 議事録

## 決まったこと
- [副局長] 進捗報告は 1 人 3 分まで: テキストで読める内容は話さない

## TODO
- [FinanSu] 購入申請フォームの画面設計を進める

## 先送りした議題
- [局長] 情報局の MVV をいつ決めるか

## 要約
（議事録の要約）`;

export default function ImportPage({ cycles, units }: Props) {
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

  return (
    <>
      <div className="sub" style={{ marginBottom: 8 }}>
        <Link href="/admin">← 管理</Link>
      </div>
      <div className="page-head">
        <div>
          <h1>議事録・過去の回の取り込み</h1>
          <div className="sub">議事録スキルの出力を貼り付けると、1 件ずつの候補に分かれます。✓ をつけたものだけ記録に登録されます。</div>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>1. 議事録を貼り付ける</h2>
          <p className="hint">
            過去の回を取り込む時は、先に<Link href="/admin">管理画面</Link>で過去の日付の回を作ってください。Notion から書き出した Markdown や文字起こしは、スキルで下の形式に変換してから貼り付けます。
          </p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={SAMPLE} style={{ minHeight: 280, fontFamily: "ui-monospace, monospace", fontSize: 13 }} />
          <div className="row" style={{ marginTop: 8 }}>
            <button className="ghost small" onClick={() => setText(SAMPLE)}>
              サンプルを入れる
            </button>
            <span className="spacer" />
            <button className="primary" onClick={parse} disabled={!text.trim()}>
              候補に分ける →
            </button>
          </div>
        </section>

        <section className="card">
          <h2>2. 確認して登録する</h2>
          {rows.length === 0 ? (
            <p className="empty">左に貼り付けて「候補に分ける」を押してください</p>
          ) : (
            <Form
              form={form}
              onSubmitCapture={() => {
                form.setData("summary", summary);
                form.setData(
                  "entries",
                  selected.map(({ kind, title, body, unitId }) => ({ kind, title, body, unitId })),
                );
              }}
            >
              <div className="field">
                <label>どの回の議事録か</label>
                <select value={form.data.cycleId} onChange={(e) => form.setData("cycleId", Number(e.target.value))}>
                  <option value={0}>選んでください</option>
                  {cycles.map((cy) => (
                    <option key={cy.id} value={cy.id}>
                      {formatJst(cy.meetingAt)}
                      {cy.status === "open" ? "（受付中）" : ""}
                    </option>
                  ))}
                </select>
                {form.errors.cycleId && <div className="error">{form.errors.cycleId}</div>}
              </div>

              <ul className="list" style={{ marginBottom: 12 }}>
                {rows.map((r, i) => (
                  <li key={i} className="stack" style={{ gap: 6 }}>
                    <div className="row">
                      <input type="checkbox" checked={r.checked} onChange={(e) => update(i, { checked: e.target.checked })} aria-label="登録する" />
                      <RecordPill kind={r.kind} />
                      <select value={r.unitId ?? ""} onChange={(e) => update(i, { unitId: e.target.value ? Number(e.target.value) : null })} style={{ width: "auto", padding: "2px 6px", fontSize: 13 }}>
                        <option value="">ユニットなし</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      {r.unitName && r.unitId === null && <span className="error">「{r.unitName}」が見つかりません</span>}
                    </div>
                    <input type="text" value={r.title} onChange={(e) => update(i, { title: e.target.value })} />
                    {r.body && <div className="meta body">{r.body}</div>}
                  </li>
                ))}
              </ul>

              {summary && (
                <div className="field">
                  <label>要約 <span className="hint">回の要約として保存されます</span></label>
                  <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
                </div>
              )}
              {form.errors.entries && <div className="error">{form.errors.entries}</div>}
              <button type="submit" className="primary" disabled={form.pending || selected.length === 0}>
                {selected.length} 件を登録する
              </button>
            </Form>
          )}
        </section>
      </div>
    </>
  );
}

/** ISO → JST の YYYY-MM-DD */
function formatDateKey(iso: string) {
  return new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
