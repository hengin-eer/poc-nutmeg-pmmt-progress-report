import { REPORT_COPY } from "./copy";
import { Form, useForm } from "@void/react";
import type { Props } from "../../pages/report.server";
import { BUSY_OPTIONS, Busy, PROGRESS_OPTIONS, type ProgressValue } from "../domain";
import { MarkdownEditor } from "../markdown-editor";
import { Button, Card, Field, Icon, SectionHeader } from "../ui";

type ProgressFormProps = Pick<Props, "unit" | "cycle" | "report">;

export function ProgressForm({ unit, cycle, report }: ProgressFormProps) {
  const isOpen = cycle.status === "open";
  const form = useForm("/report?save", {
    progress: (report?.progress ?? "") as "" | ProgressValue,
    busyness: report?.busyness ?? 0,
    done: report?.done ?? "",
    next: report?.next ?? "",
    submit: false,
  });
  const showProgress = unit.kind === "project";

    function handleProgressChange(value: (typeof PROGRESS_OPTIONS)[number]["value"]) { return form.setData("progress", form.data.progress === value ? "" : value); }

  function handleBusynessChange(value: (typeof BUSY_OPTIONS)[number]["value"]) { return form.setData("busyness", value); }

  function handleDoneChange(value: string) { return form.setData("done", value); }

  function handleNextChange(value: string) { return form.setData("next", value); }

  function handleSaveDraft() { return form.setData("submit", false); }

  function handleSubmitReport() { return form.setData("submit", true); }

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
                  onClick={() => handleProgressChange(value)}
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
                onClick={() => handleBusynessChange(value)}
              >
                <Icon name={icon} />
                {label}
                <Busy value={value} />
              </Button>
            ))}
          </div>
          {form.errors.busyness && <div className="error">{form.errors.busyness}</div>}
        </Field>

        <MarkdownEditor id="done" label={REPORT_COPY.done.label} hint={REPORT_COPY.done.hint}
          value={form.data.done ?? ""} onChange={handleDoneChange}
          placeholder={REPORT_COPY.done.placeholder} error={form.errors.done} />
        <MarkdownEditor id="next" label={REPORT_COPY.next.label} hint={REPORT_COPY.next.hint}
          value={form.data.next ?? ""} onChange={handleNextChange}
          placeholder={REPORT_COPY.next.placeholder} error={form.errors.next} />

        {form.error && <p className="error">{form.error.message}</p>}
        <div className="row" style={{ marginTop: 8 }}>
          <Button type="submit" className="ghost" disabled={!isOpen || form.pending} onClick={handleSaveDraft}>
            <Icon name="save-3-line" />
            下書き保存
          </Button>
          {form.recentlySuccessful && (
            <span className="sub">
              <Icon name="check-line" /> 保存しました
            </span>
          )}
          <span className="spacer" />
          <Button type="submit" className="primary" disabled={!isOpen || form.pending} onClick={handleSubmitReport}>
            <Icon name="send-plane-2-line" />
            {report?.submittedAt ? "更新する" : "提出する"}
          </Button>
        </div>
      </Form>
    </Card>
  );
}
