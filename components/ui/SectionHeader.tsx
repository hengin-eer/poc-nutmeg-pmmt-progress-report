import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function SectionHeader({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="sectionheader" className={twMerge("mb-4 flex items-center gap-2", className)} />;
}
