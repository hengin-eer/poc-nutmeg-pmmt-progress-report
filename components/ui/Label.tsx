import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label {...props} className={twMerge("mb-2 block text-meta font-bold", className)} />;
}
