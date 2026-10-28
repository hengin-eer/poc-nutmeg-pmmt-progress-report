import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Avatar({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={twMerge("grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-meta font-bold text-accent", className)} />;
}
