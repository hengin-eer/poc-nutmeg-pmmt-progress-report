import { inputStyles } from "./Input";
import type { ComponentProps } from "react";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={inputStyles({ className: `min-h-24 resize-y leading-relaxed ${className ?? ""}` })} />;
}
