import type { ComponentProps } from "react";
import { withBase } from "./classes";

export function PageHeader({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={withBase("page-head", className)} />;
}
