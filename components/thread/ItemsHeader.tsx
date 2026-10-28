import { PageHeader } from "../ui";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/items/index.server";

type ItemsHeaderProps = Pick<Props, "cycle">;

export function ItemsHeader({ cycle }: ItemsHeaderProps) {
  return (
    <PageHeader className="page-head">
      <div>
        {cycle && <div className="eyebrow">{formatJst(cycle.meetingAt)} の PMMT</div>}
        <h1>確認事項</h1>
      </div>
    </PageHeader>
  );
}
