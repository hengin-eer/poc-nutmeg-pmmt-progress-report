import { PageHeader } from "../ui";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/items/index.server";

export function ItemsHeader({ cycle }: Pick<Props, "cycle">) {
  return (
    <PageHeader>
      <div>
        {cycle && <div className="mb-1 text-caption font-semibold text-muted">{formatJst(cycle.meetingAt)} の PMMT</div>}
        <h1 className="text-title font-extrabold tracking-[.01em] text-text">確認事項</h1>
      </div>
    </PageHeader>
  );
}
