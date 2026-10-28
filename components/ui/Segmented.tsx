import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function Segmented({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="segmented" className={twMerge("flex flex-wrap gap-2", className)} />;
}
