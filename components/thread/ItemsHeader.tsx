import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/items/index.server";
import { PageHeader } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type ItemsHeaderProps = Pick<Props, "cycle">;

export function ItemsHeader({ cycle }: ItemsHeaderProps) {
  return (
    <PageHeader>
      <div>
        {cycle && <div className={textStyles({ role: "eyebrow" })}>{formatJst(cycle.meetingAt)} の PMMT</div>}
        <h1 className={headingStyles({ level: "title" })}>確認事項</h1>
      </div>
    </PageHeader>
  );
}
