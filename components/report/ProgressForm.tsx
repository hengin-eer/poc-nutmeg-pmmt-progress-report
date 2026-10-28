import { flowStyles } from "../ui/Flow";
import { FieldLabel } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";
import { Form, useForm } from "@void/react";
import type { Props } from "../../pages/report.server";
import { BUSY, Busy, PROGRESS_LABEL } from "../domain";
import { MarkdownEditor } from "../markdown-editor";
import { Button, Choice, Dot, Card, Field, Icon, Label, Row, SectionHeader } from "../ui";

export function ProgressForm({ unit, cycle, report }: Pick<Props, "unit" | "cycle" | "report">) {
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
              {(["green", "yellow", "red"] as const).map((v) => (
                <Choice
                  type="button"
                  key={v}
                  selected={form.data.progress === v}
                  onClick={() => form.setData("progress", form.data.progress === v ? "" : v)}
                >
                  <Dot tone={v} />
                  {PROGRESS_LABEL[v]}
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
            {([1, 2, 3] as const).map((v) => (
              <Choice
                type="button"
                key={v}
                selected={form.data.busyness === v}
                onClick={() => form.setData("busyness", v)}
              >
                <Icon name={BUSY[v].icon} />
                {BUSY[v].label}
                <Busy value={v} />
              </Choice>
            ))}
          </div>
          {form.errors.busyness && <div className={textStyles({ role: "error" })}>{form.errors.busyness}</div>}
        </Field>

        <MarkdownEditor id="done" label="今週やったこと" hint="やったこと・結果・遅れを箇条書きで。数字やリンク、関わった局も添えると、当日聞かなくても伝わります"
          value={form.data.done ?? ""} onChange={(value) => form.setData("done", value)}
          placeholder={"- ○○の画面を作った（PR #12）\n- △△局と打ち合わせ → 11/10 までに仕様を確定\n- 遅れ：□□（理由と、いつまでに戻すか）"} error={form.errors.done} />
        <MarkdownEditor id="next" label="次にやること" hint="次の回までにやること。担当と期限があれば添えて"
          value={form.data.next ?? ""} onChange={(value) => form.setData("next", value)}
          placeholder="- ○○のレビュー（佐藤・11/6）" error={form.errors.next} />

        {form.error && <p className={textStyles({ role: "error" })}>{form.error.message}</p>}
        <Row className="mt-2">
          <Button type="submit"  variant="ghost" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", false)}>
            <Icon name="save-3-line" />
            下書き保存
          </Button>
          {form.recentlySuccessful && (
            <span className={textStyles({ role: "meta" })}>
              <Icon name="check-line" /> 保存しました
            </span>
          )}
          <span className="flex-1" />
          <Button type="submit"  variant="primary" disabled={!isOpen || form.pending} onClick={() => form.setData("submit", true)}>
            <Icon name="send-plane-2-line" />
            {report?.submittedAt ? "更新する" : "提出する"}
          </Button>
        </Row>
      </Form>
    </Card>
  );
}
