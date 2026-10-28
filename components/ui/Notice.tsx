import { tv } from "./styles";
import { type VariantProps } from "tailwind-variants";
import type { ComponentProps } from "react";

const notice = tv({
  base: "m-0 flex items-center gap-2 rounded-xl px-4 py-3 text-meta font-semibold [&_i]:text-lg",
  variants: { tone: { notice: "bg-green-soft text-green", warn: "bg-yellow-soft text-yellow", info: "bg-accent-soft text-accent" } },
  defaultVariants: { tone: "notice" },
});
export function Notice({ tone, className, ...props }: ComponentProps<"p"> & VariantProps<typeof notice>) {
  return <p {...props} className={notice({ tone, className })} />;
}
