import { action, Link, useShared } from "@void/react";
import { auth } from "void/client";
import "./style.css";

const NAV = [
  { href: "/", label: "ダッシュボード" },
  { href: "/report", label: "事前記入" },
  { href: "/items", label: "確認事項" },
  { href: "/records", label: "記録" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { me, demo, path } = useShared();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  if (!me) return <>{children}</>;

  const logout = async () => {
    if (!demo) await auth.signOut();
    await action("/login?logout");
    location.href = "/login";
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">N</span>
            PMMT
          </Link>
          <nav className="nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? "active" : ""}>
                {n.label}
              </Link>
            ))}
            {me.isAdmin && (
              <Link href="/admin" className={isActive("/admin") ? "active" : ""}>
                管理
              </Link>
            )}
          </nav>
          <div className="me">
            {demo && <span className="demo-badge">デモ</span>}
            <span className="me-name">{me.name}</span>
            <button className="ghost small" onClick={logout}>
              ログアウト
            </button>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
