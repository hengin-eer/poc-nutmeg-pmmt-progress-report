import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function BrandMark({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} className={twMerge("grid size-8 shrink-0 place-items-center rounded-control bg-accent text-body font-extrabold text-white", className)} />;
}
