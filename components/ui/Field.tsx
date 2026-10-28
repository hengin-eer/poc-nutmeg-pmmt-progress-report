import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type FieldProps = ComponentProps<"div">;

export function Field({ className, ...props }: FieldProps) {
  return <div {...props} data-slot="field" className={twMerge("mb-6", className)} />;
}
