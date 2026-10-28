import type { ComponentProps } from "react";

export function Notice({ tone = "notice", className, ...props }: ComponentProps<"p"> & { tone?: "notice" | "warn" | "info" }) {
  return <p {...props} className={className ?? tone} />;
}
