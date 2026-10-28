import { useEffect, useState } from "react";
import { Button, Icon } from "../ui";

/** モバイル：画面下に浮かぶメニュー。押した位置からメニューが広がる */
type MobileMenuProps = {
  current: { label: string; icon: string };
  path: string;
  logout: () => void;
  children: React.ReactNode;
};

export function MobileMenu({
  current,
  path,
  logout,
  children,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  function handleCloseMenu() { return setOpen(false); }

  function handleToggleMenu() { return setOpen(!open); }

  const menuOpenClass = open ? "open" : "";
  const isMenuClosed = !open;
  const menuTriggerIcon = open ? "close-line" : current.icon;
  const menuTriggerLabel = open ? "閉じる" : current.label;

  return (
    <div className={`mobile-menu ${menuOpenClass}`}>
      {open && <div className="mobile-backdrop" onClick={handleCloseMenu} />}
      <div className="mobile-panel" aria-hidden={isMenuClosed}>
        <nav className="nav">{children}</nav>
        <Button type="button" className="nav-link" onClick={logout}>
          <Icon name="logout-box-r-line" />
          <span>ログアウト</span>
        </Button>
      </div>
      <Button type="button" className="mobile-trigger" onClick={handleToggleMenu} aria-expanded={open} aria-label="メニュー">
        <Icon name={menuTriggerIcon} />
        <span>{menuTriggerLabel}</span>
        {isMenuClosed && <Icon name="menu-line" className="muted" />}
      </Button>
    </div>
  );
}
