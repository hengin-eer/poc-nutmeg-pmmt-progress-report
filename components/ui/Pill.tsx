import type { ComponentProps } from "react";
import { withBase } from "./classes";

type PillProps = ComponentProps<"span">;

export function Pill({ className, ...props }: PillProps) {
  return <span {...props} className={withBase("pill", className)} />;
}
