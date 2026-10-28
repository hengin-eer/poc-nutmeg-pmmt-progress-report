import { twMerge } from "./styles";
import type { ComponentProps } from "react";

export function List({ className, ...props }: ComponentProps<"ul">) {
  return <ul {...props} className={twMerge("m-0 list-none p-0 [&>li]:border-t [&>li]:border-border [&>li]:py-4 [&>li:first-child]:border-t-0 [&>li:first-child]:pt-1 [&>li:last-child]:pb-0 [&>li[data-slot=item]]:py-1", className)} />;
}
