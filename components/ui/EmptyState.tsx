import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function EmptyState({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} data-slot="emptystate" className={twMerge("m-0 py-1 text-meta text-muted", className)} />;
}
