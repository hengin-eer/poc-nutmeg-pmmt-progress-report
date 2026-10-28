import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return <table {...props} className={twMerge("w-full border-collapse text-meta [&_th]:text-left [&_th]:text-caption [&_th]:font-bold [&_th]:text-muted [&_th]:border-b [&_th]:border-border [&_th]:px-2 [&_th]:py-3 [&_td]:border-b [&_td]:border-border [&_td]:px-2 [&_td]:py-3 [&_td]:align-middle [&_tr:last-child_td]:border-b-0", className)} />;
}
