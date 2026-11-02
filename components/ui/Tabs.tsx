import type { ComponentProps } from "react";
import { withBase } from "./classes";

type TabsProps = ComponentProps<"nav">;

export function Tabs({ className, ...props }: TabsProps) {
  return <nav {...props} className={withBase("tabs", className)} />;
}
