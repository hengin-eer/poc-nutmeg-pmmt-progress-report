import type { ComponentProps } from "react";
import { withBase } from "./classes";

type SectionHeaderProps = ComponentProps<"div">;

export function SectionHeader({ className, ...props }: SectionHeaderProps) {
  return <div {...props} className={withBase("section-head", className)} />;
}
