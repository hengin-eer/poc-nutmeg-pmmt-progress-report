import { textStyles } from "../ui/styles";

import type { ReactNode } from "react";
import type { Me } from "../../lib/server";
import { Avatar, BrandMark, Icon, IconButton, Link } from "../ui";

export function Sidebar({ me, demo, logout, children }: { me: Me; demo: boolean; logout: () => void; children: ReactNode }) {
  return (
        <aside className="sticky top-0 flex h-screen flex-col gap-6 border-r border-border bg-surface px-4 pt-6 pb-6 max-md:hidden">
          <Link href="/"  className="flex items-center gap-2 px-2 text-body tracking-wide text-text hover:no-underline [&_b]:text-accent">
            <BrandMark>N</BrandMark>
            <span>
              NUTMEG <b>PMMT</b>
            </span>
          </Link>
          <nav className="flex flex-col gap-1">{children}</nav>
          <div className="mt-auto">
            <div className="flex items-center gap-2 rounded-xl bg-surface-2 p-2">
              <Avatar aria-hidden="true">
                {me.name.slice(0, 1)}
              </Avatar>
              <div className="min-w-0 flex-1 leading-snug">
                <div className="truncate text-meta font-bold">{me.name}</div>
                <div className={textStyles({ role: "meta" })}>
                  {me.unitName ?? "ユニットなし"}
                  {demo && <span className="ml-2 rounded-full bg-yellow-soft px-2 py-px text-caption font-bold text-yellow">デモ</span>}
                </div>
              </div>
              <IconButton type="button"  onClick={logout} title="ログアウト" aria-label="ログアウト">
                <Icon name="logout-box-r-line" />
              </IconButton>
            </div>
          </div>
        </aside>
  );
}
