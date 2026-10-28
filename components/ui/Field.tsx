import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="field" className={twMerge("mb-6", className)} />;
}
