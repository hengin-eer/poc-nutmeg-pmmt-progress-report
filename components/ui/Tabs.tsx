import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type TabsProps = ComponentProps<"nav">;

export function Tabs({ className, ...props }: TabsProps) {
  return <nav {...props} data-slot="tabs" className={twMerge("mb-6 flex gap-2 overflow-x-auto [scrollbar-width:none]", className)} />;
}
