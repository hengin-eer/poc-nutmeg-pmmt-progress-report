import type { ComponentProps } from "react";
import { withBase } from "./classes";

type PageHeaderProps = ComponentProps<"div">;

export function PageHeader({ className, ...props }: PageHeaderProps) {
  return <div {...props} className={withBase("page-head", className)} />;
}
