import { tv } from "../ui/styles";

import { action } from "@void/react";
import type { ReactNode } from "react";
import { auth } from "void/client";
import type { Me } from "../../lib/server";
import { ThreadProvider } from "../thread";
import { Icon, Link } from "../ui";
import { MobileMenu } from "./MobileMenu";
import { Sidebar } from "./Sidebar";

const NAV = [
  { href: "/", label: "ダッシュボード", icon: "dashboard-3-line" },
  { href: "/report", label: "事前記入", icon: "edit-box-line" },
  { href: "/items", label: "確認事項", icon: "discuss-line" },
  { href: "/records", label: "記録", icon: "archive-stack-line" },
];
const ADMIN = { href: "/admin", label: "管理", icon: "settings-3-line" };

const navLink = tv({
  base: "flex w-full items-center gap-3 rounded-xl border-0 bg-transparent px-3 py-2 text-left text-meta font-semibold text-text-2 hover:bg-surface-2 hover:text-text hover:no-underline [&_i]:text-xl [&_i]:text-muted",
  variants: { active: { true: "bg-accent-soft text-accent [&_i]:text-accent" } },
});

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
    <Link key={n.href} href={n.href} className={navLink({ active: isActive(n.href) })} aria-current={isActive(n.href) ? "page" : undefined}>
      <Icon name={n.icon} />
      <span>{n.label}</span>
    </Link>
  ));

  return (
    <ThreadProvider>
      <div className="grid min-h-screen grid-cols-[var(--sidebar)_minmax(0,1fr)] bg-[linear-gradient(to_right,var(--surface)_calc(var(--sidebar)_-_1px),var(--border)_0_var(--sidebar),transparent_0)] max-md:block max-md:bg-none">
        <Sidebar me={me} demo={demo} logout={logout}>{links}</Sidebar>

        <main className="min-w-0 px-12 pt-10 pb-24 [&>*]:max-w-[1440px] max-md:px-4 max-md:pt-6 max-md:pb-32">{children}</main>

        <MobileMenu current={current} path={path} logout={logout}>
          {links}
        </MobileMenu>
      </div>
    </ThreadProvider>
  );
}

