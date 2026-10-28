import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="field" className={twMerge("mb-6", className)} />;
}
