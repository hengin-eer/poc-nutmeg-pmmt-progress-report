import type { ComponentProps } from "react";
import { withBase } from "./classes";

export function Segmented({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={withBase("segmented", className)} />;
}
