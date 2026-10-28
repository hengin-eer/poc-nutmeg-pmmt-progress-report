import { Link } from "@void/react";
import { Badge, Icon, Tabs } from "../ui";
import { type Props, type Tab } from "../../pages/items/index.server";

const TABS: Record<Tab, { label: string; icon: string }> = {
  open: { label: "未解決", icon: "time-line" },
  live: { label: "当日に話す", icon: "mic-line" },
  closed: { label: "閉じたもの", icon: "check-double-line" },
  all: { label: "すべて", icon: "list-check" },
};

export function ItemTabs({ tab, counts }: Pick<Props, "tab" | "counts">) {
  return (
    <Tabs className="tabs">
      {(Object.keys(TABS) as Tab[]).map((t) => (
        <Link key={t} href={`/items?tab=${t}`} className={t === tab ? "active" : ""} preserveScroll>
          <Icon name={TABS[t].icon} />
          {TABS[t].label}
          <Badge className="count">{counts[t]}</Badge>
        </Link>
      ))}
    </Tabs>
  );
}
