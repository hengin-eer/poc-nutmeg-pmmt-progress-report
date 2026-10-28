import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type PageHeaderProps = ComponentProps<"div">;

export function PageHeader({ className, ...props }: PageHeaderProps) {
  return <div {...props} data-slot="pageheader" className={twMerge("mb-8 flex flex-wrap items-end justify-between gap-4", className)} />;
}
