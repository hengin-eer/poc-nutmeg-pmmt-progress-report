import type { ComponentProps } from "react";
import { twMerge } from "./styles";

export function FieldLabel({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={twMerge("mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 [&_label]:m-0 [&_label]:whitespace-nowrap", className)} />;
}
