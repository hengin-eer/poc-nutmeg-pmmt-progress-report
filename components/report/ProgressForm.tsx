import { Form, useForm } from "@void/react";
import { type Props } from "../../pages/report.server";
import { Busy, BUSY_OPTIONS, PROGRESS_OPTIONS, type BusyValue, type ProgressValue } from "../domain";
import { MarkdownEditor } from "../markdown-editor";
import { Button, Card, Choice, Dot, Field, FieldLabel, Icon, Label, Row, SectionHeader } from "../ui";
import { flowStyles } from "../ui/Flow";
import { headingStyles, textStyles } from "../ui/styles";
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

  function isProgressSelected(value: ProgressValue) {
    return form.data.progress === value;
  }

  function isBusynessSelected(value: BusyValue) {
    return form.data.busyness === value;
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
    <Card as="section" size="large">
      <SectionHeader>
        <h2 className={headingStyles({ level: "heading" })}>今週の進捗</h2>
      </SectionHeader>
      <Form form={form}>
        {showProgress && (
          <Field>
            <FieldLabel>
              <Label>進み具合</Label>
            </FieldLabel>
            <div className={flowStyles({ direction: "wrap", gap: 2 })}>
              {PROGRESS_OPTIONS.map(({ value, label }) => (
                <Choice
                  type="button"
                  key={value}
                  selected={isProgressSelected(value)}
                  onClick={() => handleSelectProgress(value)}
                >
                  <Dot tone={value} />
                  {label}
                </Choice>
              ))}
            </div>
          </Field>
        )}

        <Field>
          <FieldLabel>
            <Label>忙しさ</Label>
          </FieldLabel>
          <div className={flowStyles({ direction: "wrap", gap: 2 })}>
            {BUSY_OPTIONS.map(({ value, label, icon }) => (
              <Choice
                type="button"
                key={value}
                selected={isBusynessSelected(value)}
                onClick={() => handleSelectBusyness(value)}
              >
                <Icon name={icon} />
                {label}
                <Busy value={value} />
              </Choice>
            ))}
          </div>
          {hasBusynessError && <div className={textStyles({ role: "error" })}>{form.errors.busyness}</div>}
        </Field>

        <MarkdownEditor id="done" label="今週やったこと" hint="やったこと・結果・遅れを箇条書きで。数字やリンク、関わった局も添えると、当日聞かなくても伝わります"
          value={doneText} onChange={handleDoneChange}
          placeholder={REPORT_COPY.done.placeholder} error={form.errors.done} />
        <MarkdownEditor id="next" label="次にやること" hint="次の回までにやること。担当と期限があれば添えて"
          value={nextText} onChange={handleNextChange}
          placeholder="- ○○のレビュー（佐藤・11/6）" error={form.errors.next} />

        {formError && <p className={textStyles({ className: "mb-3", role: "error" })}>{formError.message}</p>}
        <Row className="mt-2">
          <Button type="submit" variant="ghost" disabled={isSavingDisabled} onClick={handleSaveDraft}>
            <Icon name="save-3-line" />
            下書き保存
          </Button>
          {showSavedFeedback && (
            <span className={textStyles({ role: "meta" })}>
              <Icon name="check-line" /> 保存しました
            </span>
          )}
          <span className="flex-1" />
          <Button type="submit" variant="primary" disabled={isSavingDisabled} onClick={handleSubmitReport}>
            <Icon name="send-plane-2-line" />
            {submitLabel}
          </Button>
        </Row>
      </Form>
    </Card>
  );
}
