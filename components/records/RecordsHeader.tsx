import { headingStyles, textStyles } from "../ui/styles";
import { Icon, PageHeader, buttonStyles } from "../ui";
import { type Props } from "../../pages/records/index.server";

export function RecordsHeader({ filter }: Pick<Props, "filter">) {
  const exportQs = new URLSearchParams(
    Object.entries({ q: filter.q, kind: filter.kind, unit: filter.unitId ? String(filter.unitId) : "", status: filter.status }).filter(([, v]) => v),
  ).toString();

  return (
    <PageHeader>
      <div>
        <h1 className={headingStyles({ level: "title" })}>記録</h1>
        <div className={textStyles({ role: "lead" })}>決まったこと・TODO・先送りした議題を、回をまたいで探せます</div>
      </div>
      <a className={buttonStyles()} href={`/api/records.md${exportQs ? `?${exportQs}` : ""}`} target="_blank" rel="noreferrer">
        <Icon name="download-2-line" />
        Markdown
      </a>
    </PageHeader>
  );
}
