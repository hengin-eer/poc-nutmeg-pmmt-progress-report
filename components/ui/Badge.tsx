import type { ComponentProps } from "react";

type BadgeProps = ComponentProps<"span">;

export function Badge({ className, ...props }: BadgeProps) {
  const badgeClassName = className ?? "count";

  return <span {...props} className={badgeClassName} />;
}
