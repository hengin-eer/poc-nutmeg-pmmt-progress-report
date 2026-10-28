import { Link } from "@void/react";
import type { ReactNode } from "react";
import type { Me } from "../../lib/server";
import { Icon, IconButton } from "../ui";

export function Sidebar({ me, demo, logout, children }: { me: Me; demo: boolean; logout: () => void; children: ReactNode }) {
  return (
        <aside className="sidebar">
          <Link href="/" className="brand">
            <span className="brand-mark">N</span>
            <span>
              NUTMEG <b>PMMT</b>
            </span>
          </Link>
          <nav className="nav">{children}</nav>
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
              <IconButton type="button" className="icon-button" onClick={logout} title="ログアウト" aria-label="ログアウト">
                <Icon name="logout-box-r-line" />
              </IconButton>
            </div>
          </div>
        </aside>
  );
}
