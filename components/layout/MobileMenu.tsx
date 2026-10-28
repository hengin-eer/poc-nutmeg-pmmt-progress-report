import { tv } from "../ui/styles";
import { type ReactNode, useEffect, useState } from "react";
import { Button, Icon } from "../ui";

const menu = tv({
  slots: {
    root: "pointer-events-none fixed inset-x-0 bottom-6 z-40 hidden max-md:block",
    backdrop: "pointer-events-auto fixed inset-0 animate-fade bg-overlay/30",
    panel: "invisible absolute bottom-[calc(100%+12px)] left-1/2 w-[min(320px,calc(100vw-32px))] -translate-x-1/2 origin-[50%_calc(100%+36px)] scale-40 rounded-[20px] border border-border bg-surface p-3 opacity-0 shadow-panel transition-[scale,opacity,visibility] duration-200 ease-[cubic-bezier(.2,.9,.3,1.2)]",
    nav: "mb-1 flex flex-col gap-1 border-b border-border pb-2",
    trigger: "pointer-events-auto mx-auto flex items-center gap-2 rounded-full border border-border bg-surface/92 px-6 py-3 text-body font-bold text-text shadow-panel backdrop-blur-md hover:bg-surface [&_i]:text-xl",
  },
  variants: { open: { true: { panel: "pointer-events-auto visible scale-100 opacity-100" } } },
});

export function MobileMenu({ current, path, logout, children }: {
  current: { label: string; icon: string };
  path: string;
  logout: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const styles = menu({ open });
  return (
    <div data-slot="mobile-menu" className={styles.root()}>
      {open && <div className={styles.backdrop()} onClick={() => setOpen(false)} />}
      <div data-slot="mobile-panel" className={styles.panel()} aria-hidden={!open}>
        <nav className={styles.nav()}>{children}</nav>
        <Button variant="plain" className="w-full gap-3 rounded-xl px-3 py-2 text-meta font-semibold text-text-2 hover:bg-surface-2" onClick={logout}>
          <Icon name="logout-box-r-line" className="text-xl text-muted" />
          <span>ログアウト</span>
        </Button>
      </div>
      <Button variant="plain" type="button" className={styles.trigger()} onClick={() => setOpen(!open)} aria-expanded={open} aria-label="メニュー">
        <Icon name={open ? "close-line" : current.icon} />
        <span>{open ? "閉じる" : current.label}</span>
        {!open && <Icon name="menu-line" className="text-muted" />}
      </Button>
    </div>
  );
}
