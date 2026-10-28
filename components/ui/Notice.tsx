import type { ComponentProps } from "react";

type NoticeProps = ComponentProps<"p"> & { tone?: "notice" | "warn" | "info" };

export function Notice({ tone = "notice", className, ...props }: NoticeProps) {
  return <p {...props} className={className ?? tone} />;
}
