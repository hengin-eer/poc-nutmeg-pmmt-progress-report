import type { ComponentProps } from "react";
import { withBase } from "./classes";

export function EmptyState({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} className={withBase("empty", className)} />;
}
