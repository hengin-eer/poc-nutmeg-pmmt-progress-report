import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const badgeStyles = tv({
  base: "text-caption font-semibold text-muted",
  variants: { source: {
    manual: "inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-bold text-text-2",
    minutes: "inline-flex items-center gap-1 rounded-md border border-yellow/40 px-2 py-1 font-bold text-yellow",
    thread: "inline-flex items-center gap-1 rounded-md border border-accent/40 px-2 py-1 font-bold text-accent hover:bg-accent-soft hover:no-underline",
  } },
});
export function Badge({ className, source, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeStyles>) {
  return <span {...props} className={badgeStyles({ source, className })} />;
}
