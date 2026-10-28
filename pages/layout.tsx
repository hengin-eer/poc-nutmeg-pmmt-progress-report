import { action, Link, useShared } from "@void/react";
import "remixicon/fonts/remixicon.css";
import { useEffect, useState } from "react";
import { auth } from "void/client";
import { ThreadProvider } from "../components/thread";
import { Icon } from "../components/ui";
import "./app.css";
import "./style.css";

const NAV = [
  { href: "/", label: "ダッシュボード", icon: "dashboard-3-line" },
  { href: "/report", label: "事前記入", icon: "edit-box-line" },
  { href: "/items", label: "確認事項", icon: "discuss-line" },
  { href: "/records", label: "記録", icon: "archive-stack-line" },
];
const ADMIN = { href: "/admin", label: "管理", icon: "settings-3-line" };

export default function Layout({ children }: { children: React.ReactNode }) {
  const { me, demo, path } = useShared();
  if (!me) return <>{children}</>;

  const nav = me.isAdmin ? [...NAV, ADMIN] : NAV;
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const current = nav.find((n) => isActive(n.href)) ?? nav[0];

  const logout = async () => {
    if (!demo) await auth.signOut();
    await action("/login?logout");
    location.href = "/login";
  };

  const links = nav.map((n) => (
    <Link key={n.href} href={n.href} className={`nav-link ${isActive(n.href) ? "active" : ""}`}>
      <Icon name={n.icon} />
      <span>{n.label}</span>
    </Link>
  ));

  return (
    <ThreadProvider>
      <div className="shell">
        <aside className="sidebar">
          <Link href="/" className="brand">
            <span className="brand-mark">N</span>
            <span>
              NUTMEG <b>PMMT</b>
            </span>
          </Link>
          <nav className="nav">{links}</nav>
          <div className="sidebar-foot">
            <div className="me">
              <div className="avatar" aria-hidden="true">
                {me.name.slice(0, 1)}
              </div>
              <div className="me-text">
                <div className="me-name">{me.name}</div>
                <div className="meta">
                  {me.unitName ?? "ユニットなし"}
                  {demo && <span className="demo-badge">デモ</span>}
                </div>
              </div>
              <button type="button" className="icon-button" onClick={logout} title="ログアウト" aria-label="ログアウト">
                <Icon name="logout-box-r-line" />
              </button>
            </div>
          </div>
        </aside>

        <main className="main">{children}</main>

        <MobileMenu current={current} path={path} logout={logout}>
          {links}
        </MobileMenu>
      </div>
    </ThreadProvider>
  );
}

/** モバイル：画面下に浮かぶメニュー。押した位置からメニューが広がる */
function MobileMenu({
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
        <button type="button" className="nav-link" onClick={logout}>
          <Icon name="logout-box-r-line" />
          <span>ログアウト</span>
        </button>
      </div>
      <button type="button" className="mobile-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="メニュー">
        <Icon name={open ? "close-line" : current.icon} />
        <span>{open ? "閉じる" : current.label}</span>
        {!open && <Icon name="menu-line" className="muted" />}
      </button>
    </div>
  );
}
