import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label {...props} className={twMerge("mb-2 block text-meta font-bold", className)} />;
}
