import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function PageHeader({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="pageheader" className={twMerge("mb-8 flex flex-wrap items-end justify-between gap-4", className)} />;
}
