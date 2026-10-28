import type { ComponentProps } from "react";
import { inputStyles } from "./Input";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={inputStyles({ className: `min-h-24 resize-y leading-relaxed ${className ?? ""}` })} />;
}
