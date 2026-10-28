import { type Props } from "../../pages/records/index.server";
import { Icon, PageHeader, buttonStyles } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type RecordsHeaderProps = Pick<Props, "filter">;

export function RecordsHeader({ filter }: RecordsHeaderProps) {
  const exportQs = new URLSearchParams(
    Object.entries({ q: filter.q, kind: filter.kind, unit: filter.unitId ? String(filter.unitId) : "", status: filter.status }).filter(([, v]) => v),
  ).toString();
  const exportQuerySuffix = exportQs ? `?${exportQs}` : "";

  return (
    <PageHeader>
      <div>
        <h1 className={headingStyles({ level: "title" })}>記録</h1>
        <div className={textStyles({ role: "lead" })}>決まったこと・TODO・先送りした議題を、回をまたいで探せます</div>
      </div>
      <a className={buttonStyles()} href={`/api/records.md${exportQuerySuffix}`} target="_blank" rel="noreferrer">
        <Icon name="download-2-line" />
        Markdown
      </a>
    </PageHeader>
  );
}
