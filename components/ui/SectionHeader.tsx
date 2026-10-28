import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function SectionHeader({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="sectionheader" className={twMerge("mb-4 flex items-center gap-2", className)} />;
}
