import type { ComponentProps } from "react";
import { inputStyles } from "./Input";

type TextareaProps = ComponentProps<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  const extraClassName = className ?? "";

  return <textarea {...props} className={inputStyles({ className: `min-h-24 resize-y leading-relaxed ${extraClassName}` })} />;
}
