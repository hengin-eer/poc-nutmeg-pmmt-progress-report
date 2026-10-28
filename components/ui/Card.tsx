import type { HTMLAttributes } from "react";
import { withBase } from "./classes";

type Props = HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" };

export function Card({ as: Tag = "div", className, ...props }: Props) {
  return <Tag {...props} className={withBase("card", className)} />;
}
