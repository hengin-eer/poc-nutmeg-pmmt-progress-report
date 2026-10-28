import type { ComponentProps } from "react";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} className={className ?? "count"} />;
}
