import { action, Form, Link, useForm } from "@void/react";
import { useEffect, useState } from "react";
import { BUSY_LABEL, CrossBureau, KindLabel, PROGRESS_LABEL, RecordPill, StatePill, UNIT_KIND_LABEL } from "../components/ui";
import { formatJst, remainingLabel } from "../lib/domain";
import type { Props } from "./report.server";

export default function ReportPage({ unit, cycle, report, myItems, pending, now }: Props) {
  const isOpen = cycle.status === "open";
  const form = useForm("/report?save", {
    progress: (report?.progress ?? "") as "" | "green" | "yellow" | "red",
    busyness: report?.busyness ?? 0,
    done: report?.done ?? "",
    next: report?.next ?? "",
    submit: false,
  });
  const showProgress = unit.kind === "project";

  return (
    <>
      <div className="page-head">
        <div>
          <div className="sub">{UNIT_KIND_LABEL[unit.kind]}</div>
          <h1>{unit.name} の事前記入</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="sub">PMMT {formatJst(cycle.meetingAt)}</div>
          <div>
            締切 <strong>{formatJst(cycle.deadlineAt)}</strong>{" "}
            <span className="sub">（{isOpen ? remainingLabel(cycle.deadlineAt, new Date(now)) : "終了"}）</span>
          </div>
        </div>
      </div>

      {report?.submittedAt ? (
        <p className="notice">✅ {formatJst(report.submittedAt)} に提出済みです。締切までは直せます。</p>
      ) : (
        <p className="warn">まだ提出していません。書けたら「提出する」を押してください（下書き保存もできます）。</p>
      )}

      {pending.length > 0 && (
        <section className="card section" style={{ marginTop: 16 }}>
          <h2>前回からの持ち越し</h2>
          <p className="hint">終わったらチェックしてください。次の回にも残り続けます。</p>
          <ul className="list">
            {pending.map((r) => (
              <li key={r.id} className="row">
                <input
                  type="checkbox"
                  id={`rec-${r.id}`}
                  disabled={!isOpen}
                  onChange={(e) => action("/report?toggleRecord", { data: { id: r.id, done: e.target.checked } })}
                />
                <RecordPill kind={r.kind} />
                <label htmlFor={`rec-${r.id}`} style={{ margin: 0, fontWeight: 500 }}>
                  {r.title}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-2 section">
        <section className="card">
          <h2>今週の進捗</h2>
          <Form form={form}>
            {showProgress && (
              <div className="field">
                <label>
                  進み具合 <span className="hint">プロジェクトのみ</span>
                </label>
                <div className="choices">
                  {(["green", "yellow", "red"] as const).map((v) => (
                    <button
                      type="button"
                      key={v}
                      className={`choice ${form.data.progress === v ? "selected" : ""}`}
                      onClick={() => form.setData("progress", form.data.progress === v ? "" : v)}
                    >
                      <span className={`dot ${v}`} />
                      {PROGRESS_LABEL[v]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label>忙しさ</label>
              <div className="choices">
                {[1, 2, 3].map((v) => (
                  <button
                    type="button"
                    key={v}
                    className={`choice ${form.data.busyness === v ? "selected" : ""}`}
                    onClick={() => form.setData("busyness", v)}
                  >
                    {"▮".repeat(v)}
                    {"▯".repeat(3 - v)} {BUSY_LABEL[v]}
                  </button>
                ))}
              </div>
              {form.errors.busyness && <div className="error">{form.errors.busyness}</div>}
            </div>

            <div className="field">
              <label htmlFor="done">
                今週やったこと <span className="hint">箇条書き 1〜3 行。当日は話さないので、読めばわかるように</span>
              </label>
              <textarea id="done" value={form.data.done} onChange={(e) => form.setData("done", e.target.value)} placeholder={"- ○○の画面を作った\n- △△局と打ち合わせ"} />
              {form.errors.done && <div className="error">{form.errors.done}</div>}
            </div>

            <div className="field">
              <label htmlFor="next">
                次にやること <span className="hint">次の回で確認に使います</span>
              </label>
              <textarea id="next" value={form.data.next} onChange={(e) => form.setData("next", e.target.value)} placeholder="- ○○のレビュー" />
            </div>

            {form.error && <p className="error">{form.error.message}</p>}
            <div className="row">
              <button type="submit" className="ghost" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", false)}>
                下書き保存
              </button>
              {form.recentlySuccessful && <span className="sub">保存しました ✓</span>}
              <span className="spacer" />
              <button type="submit" className="primary" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", true)}>
                {report?.submittedAt ? "更新する" : "提出する"}
              </button>
            </div>
          </Form>
        </section>

        <section className="stack">
          <ItemSection
            title="確認したいこと"
            kind="confirm"
            hint="判断や返事がほしいこと。1 件ずつ書くと、それぞれにコメントがついて、決定・当日に話す・解決済みで閉じられます。"
            list={myItems.filter((i) => i.kind === "confirm")}
            isOpen={isOpen}
          />
          <ItemSection
            title="話したいこと"
            kind="talk"
            hint="小話・アイデア・耳寄りな情報など（任意）。リアクションで気軽に反応できます。"
            list={myItems.filter((i) => i.kind === "talk")}
            isOpen={isOpen}
          />
        </section>
      </div>
    </>
  );
}

function ItemSection({
  title,
  kind,
  hint,
  list,
  isOpen,
}: {
  title: string;
  kind: "confirm" | "talk";
  hint: string;
  list: Props["myItems"];
  isOpen: boolean;
}) {
  const form = useForm("/report?addItem", { kind, body: "", crossBureau: false }, { resetOnSuccess: true });
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    if (form.wasSuccessful) setAdding(false);
  }, [form.wasSuccessful]);

  return (
    <div className="card">
      <h2>
        {title} <span className="pill">{list.length}</span>
      </h2>
      <p className="hint">{hint}</p>
      {list.length > 0 && (
        <ul className="list" style={{ marginBottom: 12 }}>
          {list.map((i) => (
            <li key={i.id}>
              <div className="row" style={{ marginBottom: 4 }}>
                <KindLabel kind={i.kind} />
                <StatePill state={i.state} />
                <CrossBureau on={i.crossBureau} />
                <span className="spacer" />
                <Link href={`/items/${i.id}`} className="meta">
                  スレッドを開く
                </Link>
                {i.state === "open" && isOpen && (
                  <button
                    className="ghost small danger"
                    onClick={() => confirm("削除しますか？") && action("/report?deleteItem", { data: { id: i.id } })}
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="body">{i.body}</div>
            </li>
          ))}
        </ul>
      )}
      {isOpen &&
        (adding ? (
          <Form form={form}>
            <div className="field">
              <textarea autoFocus value={form.data.body} onChange={(e) => form.setData("body", e.target.value)} placeholder={kind === "confirm" ? "例: ○○を△△にしてもいい？" : "例: こんな勉強会をやってみたい"} />
              {form.errors.body && <div className="error">{form.errors.body}</div>}
            </div>
            {kind === "confirm" && (
              <label className="row" style={{ fontWeight: 500 }}>
                <input type="checkbox" checked={form.data.crossBureau} onChange={(e) => form.setData("crossBureau", e.target.checked)} />
                他局・実行委員全体に関わる
              </label>
            )}
            <div className="row" style={{ marginTop: 8 }}>
              <button type="button" className="ghost small" onClick={() => setAdding(false)}>
                やめる
              </button>
              <button type="submit" className="primary small" disabled={form.pending}>
                追加
              </button>
            </div>
          </Form>
        ) : (
          <button className="small" onClick={() => setAdding(true)}>
            ＋ {title}を追加
          </button>
        ))}
    </div>
  );
}
