import { inputStyles } from "./Input";
import { tv } from "./styles";
import type { ComponentProps } from "react";

const select = tv({ extend: inputStyles, variants: { compact: { true: "w-auto px-2 py-2 text-meta" } } });
export function Select({ compact, className, ...props }: ComponentProps<"select"> & { compact?: boolean }) {
  return <select {...props} className={select({ compact, className })} />;
}
