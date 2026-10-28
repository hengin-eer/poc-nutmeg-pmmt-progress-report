import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Checkbox({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return <input {...props} type="checkbox" className={twMerge("m-0 size-4 shrink-0 accent-accent focus-visible:outline-3 focus-visible:outline-accent-soft", className)} />;
}
