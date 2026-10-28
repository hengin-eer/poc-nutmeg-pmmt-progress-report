import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type EmptyStateProps = ComponentProps<"p">;

export function EmptyState({ className, ...props }: EmptyStateProps) {
  return <p {...props} data-slot="emptystate" className={twMerge("m-0 py-1 text-meta text-muted", className)} />;
}
