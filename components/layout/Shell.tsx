import { action, Link } from "@void/react";
import type { ReactNode } from "react";
import { auth } from "void/client";
import type { Me } from "../../lib/server";
import { ThreadProvider } from "../thread";
import { Icon } from "../ui";
import { MobileMenu } from "./MobileMenu";
import { Sidebar } from "./Sidebar";

const NAV = [
  { href: "/", label: "ダッシュボード", icon: "dashboard-3-line" },
  { href: "/report", label: "事前記入", icon: "edit-box-line" },
  { href: "/items", label: "確認事項", icon: "discuss-line" },
  { href: "/records", label: "記録", icon: "archive-stack-line" },
];
const ADMIN = { href: "/admin", label: "管理", icon: "settings-3-line" };

export function Shell({ me, demo, path, children }: { me: Me; demo: boolean; path: string; children: ReactNode }) {

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
        <Sidebar me={me} demo={demo} logout={logout}>{links}</Sidebar>

        <main className="main">{children}</main>

        <MobileMenu current={current} path={path} logout={logout}>
          {links}
        </MobileMenu>
      </div>
    </ThreadProvider>
  );
}

