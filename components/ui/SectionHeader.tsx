import type { ComponentProps } from "react";
import { withBase } from "./classes";

export function SectionHeader({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={withBase("section-head", className)} />;
}
