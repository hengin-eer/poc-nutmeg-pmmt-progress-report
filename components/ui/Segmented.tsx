import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Segmented({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="segmented" className={twMerge("flex flex-wrap gap-2", className)} />;
}
