import type { ComponentProps } from "react";
import { inputStyles } from "./Input";

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={inputStyles({ className })} />;
}
