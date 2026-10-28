import { useEffect, useState } from "react";
import { Button, Icon } from "../ui";

/** モバイル：画面下に浮かぶメニュー。押した位置からメニューが広がる */
export function MobileMenu({
  current,
  path,
  logout,
  children,
}: {
  current: { label: string; icon: string };
  path: string;
  logout: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <div className={`mobile-menu ${open ? "open" : ""}`}>
      {open && <div className="mobile-backdrop" onClick={() => setOpen(false)} />}
      <div className="mobile-panel" aria-hidden={!open}>
        <nav className="nav">{children}</nav>
        <Button type="button" className="nav-link" onClick={logout}>
          <Icon name="logout-box-r-line" />
          <span>ログアウト</span>
        </Button>
      </div>
      <Button type="button" className="mobile-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="メニュー">
        <Icon name={open ? "close-line" : current.icon} />
        <span>{open ? "閉じる" : current.label}</span>
        {!open && <Icon name="menu-line" className="muted" />}
      </Button>
    </div>
  );
}
