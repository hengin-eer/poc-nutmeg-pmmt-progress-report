import type { ComponentProps } from "react";
import { withBase } from "./classes";

type EmptyStateProps = ComponentProps<"p">;

export function EmptyState({ className, ...props }: EmptyStateProps) {
  return <p {...props} className={withBase("empty", className)} />;
}
