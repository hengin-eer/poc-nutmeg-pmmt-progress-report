import type { ComponentProps } from "react";
import { withBase } from "./classes";

export function Pill({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} className={withBase("pill", className)} />;
}
