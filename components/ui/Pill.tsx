import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const pill = tv({
  base: "inline-flex items-center gap-1 rounded-full px-2 py-1 text-caption leading-normal font-bold whitespace-nowrap [&_i]:text-caption",
  variants: { tone: {
    neutral: "bg-surface-2 text-muted",
    green: "bg-green-soft text-green",
    yellow: "bg-yellow-soft text-yellow",
    red: "bg-red-soft text-red",
    purple: "bg-purple-soft text-purple",
    accent: "bg-accent-soft text-accent",
  } },
  defaultVariants: { tone: "neutral" },
});
export function Pill({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof pill>) {
  return <span {...props} className={pill({ tone, className })} />;
}
