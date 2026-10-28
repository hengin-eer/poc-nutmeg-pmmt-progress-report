import { Form, useForm } from "@void/react";
import type { Props } from "../../pages/report.server";
import { BUSY_OPTIONS, Busy, PROGRESS_OPTIONS, type BusyValue, type ProgressValue } from "../domain";
import { MarkdownEditor } from "../markdown-editor";
import { Button, Card, Field, Icon, SectionHeader } from "../ui";
import { REPORT_COPY } from "./copy";

type ProgressFormProps = Pick<Props, "unit" | "cycle" | "report">;

export function ProgressForm({ unit, cycle, report }: ProgressFormProps) {
  const initialProgress: ProgressValue | "" = report?.progress ?? "";
  const form = useForm("/report?save", {
    progress: initialProgress,
    busyness: report?.busyness ?? 0,
    done: report?.done ?? "",
    next: report?.next ?? "",
    submit: false,
  });

  const isOpen = cycle.status === "open";
  const showProgress = unit.kind === "project";
  const hasBusynessError = Boolean(form.errors.busyness);
  const doneText = form.data.done ?? "";
  const nextText = form.data.next ?? "";
  const formError = form.error;
  const isSavingDisabled = !isOpen || form.pending;
  const showSavedFeedback = form.recentlySuccessful;
  const submitLabel = report?.submittedAt ? "更新する" : "提出する";

  function getProgressChoiceClass(value: ProgressValue) {
    return form.data.progress === value ? "selected" : "";
  }

  function getBusynessChoiceClass(value: BusyValue) {
    return form.data.busyness === value ? "selected" : "";
  }

  function handleSelectProgress(value: ProgressValue) {
    const isAlreadySelected = form.data.progress === value;
    form.setData("progress", isAlreadySelected ? "" : value);
  }

  function handleSelectBusyness(value: BusyValue) {
    form.setData("busyness", value);
  }

  function handleDoneChange(value: string) {
    form.setData("done", value);
  }

  function handleNextChange(value: string) {
    form.setData("next", value);
  }

  function handleSaveDraft() {
    form.setData("submit", false);
  }

  function handleSubmitReport() {
    form.setData("submit", true);
  }

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
                  className={`choice ${getProgressChoiceClass(value)}`}
                  onClick={() => handleSelectProgress(value)}
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
                className={`choice busy-${value} ${getBusynessChoiceClass(value)}`}
                onClick={() => handleSelectBusyness(value)}
              >
                <Icon name={icon} />
                {label}
                <Busy value={value} />
              </Button>
            ))}
          </div>
          {hasBusynessError && <div className="error">{form.errors.busyness}</div>}
        </Field>

        <MarkdownEditor id="done" label={REPORT_COPY.done.label} hint={REPORT_COPY.done.hint}
          value={doneText} onChange={handleDoneChange}
          placeholder={REPORT_COPY.done.placeholder} error={form.errors.done} />
        <MarkdownEditor id="next" label={REPORT_COPY.next.label} hint={REPORT_COPY.next.hint}
          value={nextText} onChange={handleNextChange}
          placeholder={REPORT_COPY.next.placeholder} error={form.errors.next} />

        {formError && <p className="error">{formError.message}</p>}
        <div className="row" style={{ marginTop: 8 }}>
          <Button type="submit" className="ghost" disabled={isSavingDisabled} onClick={handleSaveDraft}>
            <Icon name="save-3-line" />
            下書き保存
          </Button>
          {showSavedFeedback && (
            <span className="sub">
              <Icon name="check-line" /> 保存しました
            </span>
          )}
          <span className="spacer" />
          <Button type="submit" className="primary" disabled={isSavingDisabled} onClick={handleSubmitReport}>
            <Icon name="send-plane-2-line" />
            {submitLabel}
          </Button>
        </div>
      </Form>
    </Card>
  );
}
