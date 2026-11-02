import type { ComponentProps } from "react";
import { inputStyles } from "./Input";
import { tv } from "./styles";

const select = tv({ extend: inputStyles, variants: { compact: { true: "w-auto px-2 py-2 text-meta" } } });
type SelectProps = ComponentProps<"select"> & { compact?: boolean };

export function Select({ compact, className, ...props }: SelectProps) {
  return <select {...props} className={select({ compact, className })} />;
}
