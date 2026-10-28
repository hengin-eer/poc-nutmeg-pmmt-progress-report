import type { ComponentProps } from "react";

type BadgeProps = ComponentProps<"span">;

export function Badge({ className, ...props }: BadgeProps) {
  return <span {...props} className={className ?? "count"} />;
}
