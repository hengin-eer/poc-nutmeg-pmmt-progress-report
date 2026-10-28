import type { ComponentProps } from "react";
import { withBase } from "./classes";

export function Tabs({ className, ...props }: ComponentProps<"nav">) {
  return <nav {...props} className={withBase("tabs", className)} />;
}
