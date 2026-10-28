import type { Props } from "../../pages/report.server";
import { formatJst, remainingLabel } from "../../lib/domain";
import { UNIT_KIND_LABEL } from "../domain";
import { Icon, Notice, PageHeader } from "../ui";

type ReportHeaderProps = Pick<Props, "unit" | "cycle" | "report" | "now">;

export function ReportHeader({ unit, cycle, report, now }: ReportHeaderProps) {
  const isOpen = cycle.status === "open";
  return (
    <>
      <PageHeader className="page-head">
        <div>
          <div className="eyebrow">{UNIT_KIND_LABEL[unit.kind]}</div>
          <h1>{unit.name} の事前記入</h1>
        </div>
        <div className="hero-deadline">
          <Icon name="alarm-line" />
          締切 <strong>{formatJst(cycle.deadlineAt)}</strong>
          <span className="remaining">{isOpen ? remainingLabel(cycle.deadlineAt, new Date(now)) : "終了"}</span>
        </div>
      </PageHeader>

      {report?.submittedAt ? (
        <Notice className="notice">
          <Icon name="checkbox-circle-fill" />
          提出済み（{formatJst(report.submittedAt)}）。締切までは直せます
        </Notice>
      ) : (
        <Notice className="warn">
          <Icon name="error-warning-line" />
          まだ提出していません
        </Notice>
      )}
    </>
  );
}
