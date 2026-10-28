import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type SectionHeaderProps = ComponentProps<"div">;

export function SectionHeader({ className, ...props }: SectionHeaderProps) {
  return <div {...props} data-slot="sectionheader" className={twMerge("mb-4 flex items-center gap-2", className)} />;
}
