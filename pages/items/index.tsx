import { CycleSwitcher } from "../../components/CycleSwitcher";
import { ItemsHeader } from "../../components/thread/ItemsHeader";
import { ItemsPanel } from "../../components/thread/ItemsPanel";
import { ItemTabs } from "../../components/thread/ItemTabs";
import type { Props } from "./index.server";

export default function ItemsPage({ tab, cycle, cycleOptions, list, counts }: Props) {
  return (
    <div className="max-w-[960px]">
      <ItemsHeader cycle={cycle} />
      {cycle && <CycleSwitcher path="/items" selectedId={cycle.id} cycles={cycleOptions} tab={tab} />}
      <ItemTabs tab={tab} counts={counts} cycleId={cycle?.id} />
      <ItemsPanel tab={tab} list={list} />
    </div>
  );
}
