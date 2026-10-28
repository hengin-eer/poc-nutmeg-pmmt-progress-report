import type { HTMLAttributes } from "react";
import { withBase } from "./classes";

type CardProps = HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" };

export function Card({ as: Tag = "div", className, ...props }: CardProps) {
  return <Tag {...props} className={withBase("card", className)} />;
}
