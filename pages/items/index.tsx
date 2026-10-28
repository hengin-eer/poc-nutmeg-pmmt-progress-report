import { ItemsHeader } from "../../components/thread/ItemsHeader";
import { ItemsPanel } from "../../components/thread/ItemsPanel";
import { ItemTabs } from "../../components/thread/ItemTabs";
import type { Props } from "./index.server";

export default function ItemsPage({ tab, cycle, list, counts }: Props) {
  return (
    <div className="narrow" style={{ maxWidth: 960 }}>
      <ItemsHeader cycle={cycle} />
      <ItemTabs tab={tab} counts={counts} />
      <ItemsPanel tab={tab} list={list} />
    </div>
  );
}
