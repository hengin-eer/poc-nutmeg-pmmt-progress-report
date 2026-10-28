import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function Tabs({ className, ...props }: ComponentProps<"nav">) {
  return <nav {...props} data-slot="tabs" className={twMerge("mb-6 flex gap-2 overflow-x-auto [scrollbar-width:none]", className)} />;
}
