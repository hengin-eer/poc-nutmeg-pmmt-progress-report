import { headingStyles, textStyles } from "../ui/styles";
import { PageHeader } from "../ui";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/items/index.server";

export function ItemsHeader({ cycle }: Pick<Props, "cycle">) {
  return (
    <PageHeader>
      <div>
        {cycle && <div className={textStyles({ role: "eyebrow" })}>{formatJst(cycle.meetingAt)} の PMMT</div>}
        <h1 className={headingStyles({ level: "title" })}>確認事項</h1>
      </div>
    </PageHeader>
  );
}
