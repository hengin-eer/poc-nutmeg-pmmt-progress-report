import type { ComponentProps } from "react";
import { withBase } from "./classes";

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={withBase("field", className)} />;
}
