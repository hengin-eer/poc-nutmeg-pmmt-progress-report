import { tv } from "../ui/styles";
import { Badge, Icon, Link, Tabs } from "../ui";
import { type Props, type Tab } from "../../pages/items/index.server";

const TABS: Record<Tab, { label: string; icon: string }> = {
  open: { label: "未解決", icon: "time-line" },
  live: { label: "当日に話す", icon: "mic-line" },
  closed: { label: "閉じたもの", icon: "check-double-line" },
  all: { label: "すべて", icon: "list-check" },
};

const tabLink = tv({
  base: "inline-flex items-center gap-2 rounded-full px-4 py-2 text-meta font-semibold whitespace-nowrap text-text-2 hover:bg-surface-2 hover:no-underline",
  variants: { active: { true: "bg-text text-bg hover:bg-text [&_span]:text-inherit [&_span]:opacity-70" } },
});

export function ItemTabs({ tab, counts }: Pick<Props, "tab" | "counts">) {
  return (
    <Tabs>
      {(Object.keys(TABS) as Tab[]).map((t) => (
        <Link key={t} href={`/items?tab=${t}`} className={tabLink({ active: t === tab })} aria-current={t === tab ? "page" : undefined} preserveScroll>
          <Icon name={TABS[t].icon} />
          {TABS[t].label}
          <Badge>{counts[t]}</Badge>
        </Link>
      ))}
    </Tabs>
  );
}
