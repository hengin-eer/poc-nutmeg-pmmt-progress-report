import { Form, useForm } from "@void/react";
import type { Props } from "../../pages/report.server";
import { BUSY_OPTIONS, Busy, PROGRESS_OPTIONS, type ProgressValue } from "../domain";
import { MarkdownEditor } from "../markdown-editor";
import { Button, Card, Field, Icon, SectionHeader } from "../ui";

export function ProgressForm({ unit, cycle, report }: Pick<Props, "unit" | "cycle" | "report">) {
  const isOpen = cycle.status === "open";
  const form = useForm("/report?save", {
    progress: (report?.progress ?? "") as "" | ProgressValue,
    busyness: report?.busyness ?? 0,
    done: report?.done ?? "",
    next: report?.next ?? "",
    submit: false,
  });
  const showProgress = unit.kind === "project";

  return (
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head">
        <h2>今週の進捗</h2>
      </SectionHeader>
      <Form form={form}>
        {showProgress && (
          <Field className="field">
            <div className="field-label">
              <label>進み具合</label>
            </div>
            <div className="choices">
              {PROGRESS_OPTIONS.map(({ value, label }) => (
                <Button
                  type="button"
                  key={value}
                  className={`choice ${form.data.progress === value ? "selected" : ""}`}
                  onClick={() => form.setData("progress", form.data.progress === value ? "" : value)}
                >
                  <span className={`dot ${value}`} />
                  {label}
                </Button>
              ))}
            </div>
          </Field>
        )}

        <Field className="field">
          <div className="field-label">
            <label>忙しさ</label>
          </div>
          <div className="choices">
            {BUSY_OPTIONS.map(({ value, label, icon }) => (
              <Button
                type="button"
                key={value}
                className={`choice busy-${value} ${form.data.busyness === value ? "selected" : ""}`}
                onClick={() => form.setData("busyness", value)}
              >
                <Icon name={icon} />
                {label}
                <Busy value={value} />
              </Button>
            ))}
          </div>
          {form.errors.busyness && <div className="error">{form.errors.busyness}</div>}
        </Field>

        <MarkdownEditor id="done" label="今週やったこと" hint="やったこと・結果・遅れを箇条書きで。数字やリンク、関わった局も添えると、当日聞かなくても伝わります"
          value={form.data.done ?? ""} onChange={(value) => form.setData("done", value)}
          placeholder={"- ○○の画面を作った（PR #12）\n- △△局と打ち合わせ → 11/10 までに仕様を確定\n- 遅れ：□□（理由と、いつまでに戻すか）"} error={form.errors.done} />
        <MarkdownEditor id="next" label="次にやること" hint="次の回までにやること。担当と期限があれば添えて"
          value={form.data.next ?? ""} onChange={(value) => form.setData("next", value)}
          placeholder="- ○○のレビュー（佐藤・11/6）" error={form.errors.next} />

        {form.error && <p className="error">{form.error.message}</p>}
        <div className="row" style={{ marginTop: 8 }}>
          <Button type="submit" className="ghost" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", false)}>
            <Icon name="save-3-line" />
            下書き保存
          </Button>
          {form.recentlySuccessful && (
            <span className="sub">
              <Icon name="check-line" /> 保存しました
            </span>
          )}
          <span className="spacer" />
          <Button type="submit" className="primary" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", true)}>
            <Icon name="send-plane-2-line" />
            {report?.submittedAt ? "更新する" : "提出する"}
          </Button>
        </div>
      </Form>
    </Card>
  );
}
