import type { ComponentProps } from "react";
import { tv } from "./styles";

export const inputStyles = tv({ base: "w-full min-w-0 rounded-control border border-border bg-surface px-3 py-2 text-body text-text focus:border-accent focus:outline-3 focus:outline-accent-soft disabled:opacity-50" });
type InputProps = ComponentProps<"input">;

export function Input({ className, ...props }: InputProps) {
  return <input {...props} className={inputStyles({ className })} />;
}
