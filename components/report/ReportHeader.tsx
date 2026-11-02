import { formatJst, remainingLabel } from "../../lib/domain";
import { type Props } from "../../pages/report.server";
import { UNIT_KIND_LABEL } from "../domain";
import { Icon, Notice, PageHeader } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type ReportHeaderProps = Pick<Props, "unit" | "cycle" | "report" | "now">;

export function ReportHeader({ unit, cycle, report, now }: ReportHeaderProps) {
  const isOpen = cycle.status === "open";
  const remainingText = isOpen ? remainingLabel(cycle.deadlineAt, new Date(now)) : "終了";
  const submittedAt = report?.submittedAt;
  const hasSubmittedReport = Boolean(submittedAt);
  const submittedAtLabel = submittedAt ? formatJst(submittedAt) : "";

  return (
    <>
      <PageHeader>
        <div>
          <div className={textStyles({ role: "eyebrow" })}>{UNIT_KIND_LABEL[unit.kind]}</div>
          <h1 className={headingStyles({ level: "title" })}>{unit.name} の事前記入</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-meta text-text-2 [&_strong]:text-text">
          <Icon name="alarm-line" />
          締切 <strong>{formatJst(cycle.deadlineAt)}</strong>
          <span data-slot="remaining" className="font-bold text-accent">{remainingText}</span>
        </div>
      </PageHeader>

      {hasSubmittedReport ? (
        <Notice>
          <Icon name="checkbox-circle-fill" />
          提出済み（{submittedAtLabel}）。締切までは直せます
        </Notice>
      ) : (
        <Notice tone="warn">
          <Icon name="error-warning-line" />
          まだ提出していません
        </Notice>
      )}
    </>
  );
}
