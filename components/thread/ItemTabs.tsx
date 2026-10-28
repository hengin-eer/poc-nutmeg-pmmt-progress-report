import { Link } from "@void/react";
import { Badge, Icon, Tabs } from "../ui";
import { type Props, type Tab } from "../../pages/items/index.server";

const TABS: Record<Tab, { label: string; icon: string }> = {
  open: { label: "未解決", icon: "time-line" },
  live: { label: "当日に話す", icon: "mic-line" },
  closed: { label: "閉じたもの", icon: "check-double-line" },
  all: { label: "すべて", icon: "list-check" },
};

type ItemTabsProps = Pick<Props, "tab" | "counts">;

export function ItemTabs({ tab, counts }: ItemTabsProps) {
  function getTabClass(t: Tab) { return t === tab ? "active" : ""; }

  return (
    <Tabs className="tabs">
      {(Object.keys(TABS) as Tab[]).map((t) => (
        <Link key={t} href={`/items?tab=${t}`} className={getTabClass(t)} preserveScroll>
          <Icon name={TABS[t].icon} />
          {TABS[t].label}
          <Badge className="count">{counts[t]}</Badge>
        </Link>
      ))}
    </Tabs>
  );
}
