import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

export const inputStyles = tv({ base: "w-full min-w-0 rounded-control border border-border bg-surface px-3 py-2 font-inherit text-body text-text focus:border-accent focus:outline-3 focus:outline-accent-soft disabled:opacity-50" });
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={inputStyles({ className })} />;
}
