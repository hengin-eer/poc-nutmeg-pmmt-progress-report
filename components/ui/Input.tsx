import { tv } from "./styles";
import type { ComponentProps } from "react";

export const inputStyles = tv({ base: "w-full min-w-0 rounded-control border border-border bg-surface px-3 py-2 text-body text-text focus:border-accent focus:outline-3 focus:outline-accent-soft disabled:opacity-50" });
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={inputStyles({ className })} />;
}
