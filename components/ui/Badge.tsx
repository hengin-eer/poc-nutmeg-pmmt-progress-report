import { tv } from "./styles";
import type { ComponentProps } from "react";
import { type VariantProps } from "tailwind-variants";

export const badgeStyles = tv({
  base: "text-caption font-semibold text-muted",
  variants: { source: {
    manual: "border-border text-text-2",
    minutes: "border-yellow/40 text-yellow",
    thread: "border-accent/40 text-accent hover:bg-accent-soft hover:no-underline",
  } },
  compoundVariants: [{ source: ["manual", "minutes", "thread"], class: "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-bold" }],
});
export function Badge({ className, source, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeStyles>) {
  return <span {...props} className={badgeStyles({ source, className })} />;
}
