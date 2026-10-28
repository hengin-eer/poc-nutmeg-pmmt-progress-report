import { action, Form, useForm } from "@void/react";
import { useEffect, useState } from "react";
import { MarkdownEditor } from "../components/markdown-editor";
import { ThreadButton, useThread } from "../components/thread";
import { BUSY, Busy, CrossBureau, Icon, KIND_ICON, PROGRESS_LABEL, RecordPill, StatePill, UNIT_KIND_LABEL } from "../components/ui";
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
          <div className="eyebrow">{UNIT_KIND_LABEL[unit.kind]}</div>
          <h1>{unit.name} の事前記入</h1>
        </div>
        <div className="hero-deadline">
          <Icon name="alarm-line" />
          締切 <strong>{formatJst(cycle.deadlineAt)}</strong>
          <span className="remaining">{isOpen ? remainingLabel(cycle.deadlineAt, new Date(now)) : "終了"}</span>
        </div>
      </div>

      {report?.submittedAt ? (
        <p className="notice">
          <Icon name="checkbox-circle-fill" />
          提出済み（{formatJst(report.submittedAt)}）。締切までは直せます
        </p>
      ) : (
        <p className="warn">
          <Icon name="error-warning-line" />
          まだ提出していません
        </p>
      )}

      {pending.length > 0 && (
        <section className="card section">
          <div className="section-head">
            <Icon name="arrow-go-forward-line" className="muted" />
            <h2>前回からの持ち越し</h2>
            <span className="hint">終わったらチェック</span>
          </div>
          <ul className="list">
            {pending.map((r) => (
              <li key={r.id}>
                <label className="row" style={{ margin: 0, fontWeight: 500, gap: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    disabled={!isOpen}
                    onChange={(e) => action("/report?toggleRecord", { data: { id: r.id, done: e.target.checked } })}
                  />
                  <RecordPill kind={r.kind} />
                  <span>{r.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-2 section">
        <section className="card card-lg">
          <div className="section-head">
            <h2>今週の進捗</h2>
          </div>
          <Form form={form}>
            {showProgress && (
              <div className="field">
                <div className="field-label">
                  <label>進み具合</label>
                </div>
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
              <div className="field-label">
                <label>忙しさ</label>
              </div>
              <div className="choices">
                {([1, 2, 3] as const).map((v) => (
                  <button
                    type="button"
                    key={v}
                    className={`choice busy-${v} ${form.data.busyness === v ? "selected" : ""}`}
                    onClick={() => form.setData("busyness", v)}
                  >
                    <Icon name={BUSY[v].icon} />
                    {BUSY[v].label}
                    <Busy value={v} />
                  </button>
                ))}
              </div>
              {form.errors.busyness && <div className="error">{form.errors.busyness}</div>}
            </div>

            <MarkdownEditor id="done" label="今週やったこと" hint="1〜3 行。当日は話さないので、読めばわかるように"
              value={form.data.done ?? ""} onChange={(value) => form.setData("done", value)}
              placeholder={"- ○○の画面を作った\n- △△局と打ち合わせ"} error={form.errors.done} />
            <MarkdownEditor id="next" label="次にやること" hint="次の回の確認に使います"
              value={form.data.next ?? ""} onChange={(value) => form.setData("next", value)}
              placeholder="- ○○のレビュー" error={form.errors.next} />

            {form.error && <p className="error">{form.error.message}</p>}
            <div className="row" style={{ marginTop: 8 }}>
              <button type="submit" className="ghost" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", false)}>
                <Icon name="save-3-line" />
                下書き保存
              </button>
              {form.recentlySuccessful && (
                <span className="sub">
                  <Icon name="check-line" /> 保存しました
                </span>
              )}
              <span className="spacer" />
              <button type="submit" className="primary" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", true)}>
                <Icon name="send-plane-2-line" />
                {report?.submittedAt ? "更新する" : "提出する"}
              </button>
            </div>
          </Form>
        </section>

        <div className="stack" style={{ gap: 24 }}>
          <ItemSection
            title="確認したいこと"
            kind="confirm"
            hint="判断や返事がほしいことを 1 件ずつ"
            list={myItems.filter((i) => i.kind === "confirm")}
            isOpen={isOpen}
          />
          <ItemSection
            title="話したいこと"
            kind="talk"
            hint="小話・アイデア・耳寄りな情報（任意）"
            list={myItems.filter((i) => i.kind === "talk")}
            isOpen={isOpen}
          />
        </div>
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
  const { open } = useThread();
  useEffect(() => {
    if (form.wasSuccessful) setAdding(false);
  }, [form.wasSuccessful]);

  return (
    <section className="card">
      <div className="section-head">
        <span className={`kind-icon ${kind}`}>
          <Icon name={KIND_ICON[kind]} />
        </span>
        <h2>{title}</h2>
        <span className="count">{list.length}</span>
      </div>
      <p className="hint" style={{ marginTop: -8 }}>
        {hint}
      </p>

      {list.length > 0 && (
        <ul className="list" style={{ margin: "8px 0 16px" }}>
          {list.map((i) => (
            <li key={i.id} className="my-item">
              <button type="button" className="my-item-body" onClick={() => open(i.id)} title="スレッドを開く">
                {i.body}
              </button>
              <div className="row">
                <StatePill state={i.state} />
                <CrossBureau on={i.crossBureau} />
                <span className="spacer" />
                <ThreadButton id={i.id} comments={i.comments} />
                {i.state === "open" && isOpen && (
                  <button
                    type="button"
                    className="icon-button danger"
                    title="削除"
                    aria-label="削除"
                    onClick={() => confirm("削除しますか？") && action("/report?deleteItem", { data: { id: i.id } })}
                  >
                    <Icon name="delete-bin-line" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen &&
        (adding ? (
          <Form form={form} className="stack" style={{ gap: 10 }}>
            <div>
              <textarea
                autoFocus
                value={form.data.body}
                onChange={(e) => form.setData("body", e.target.value)}
                placeholder={kind === "confirm" ? "例: ○○を△△にしてもいい？" : "例: こんな勉強会をやってみたい"}
              />
              {form.errors.body && <div className="error">{form.errors.body}</div>}
            </div>
            <div className="row">
              {kind === "confirm" && (
                <label className="row" style={{ fontWeight: 500, margin: 0, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.data.crossBureau} onChange={(e) => form.setData("crossBureau", e.target.checked)} />
                  他局・実行委員全体に関わる
                </label>
              )}
              <span className="spacer" />
              <button type="button" className="ghost small" onClick={() => setAdding(false)}>
                やめる
              </button>
              <button type="submit" className="primary small" disabled={form.pending}>
                追加
              </button>
            </div>
          </Form>
        ) : (
          <button type="button" className="ghost add-button" onClick={() => setAdding(true)}>
            <Icon name="add-line" />
            追加
          </button>
        ))}
    </section>
  );
}
