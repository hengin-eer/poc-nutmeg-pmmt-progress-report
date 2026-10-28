import type { ComponentProps } from "react";
import { withBase } from "./classes";

type FieldProps = ComponentProps<"div">;

export function Field({ className, ...props }: FieldProps) {
  return <div {...props} className={withBase("field", className)} />;
}
