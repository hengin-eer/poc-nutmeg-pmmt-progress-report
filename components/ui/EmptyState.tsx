import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function EmptyState({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} data-slot="emptystate" className={twMerge("m-0 py-1 text-meta text-muted", className)} />;
}
