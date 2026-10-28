import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type LabelProps = ComponentProps<"label">;

export function Label({ className, ...props }: LabelProps) {
  return <label {...props} className={twMerge("mb-2 block text-meta font-bold", className)} />;
}
