import type { ComponentProps } from "react";
import { type VariantProps } from "tailwind-variants";
import { tv } from "./styles";

export const badgeStyles = tv({
  base: "text-caption font-semibold text-muted",
  variants: { source: {
    manual: "border-border text-text-2",
    minutes: "border-yellow/40 text-yellow",
    thread: "border-accent/40 text-accent hover:bg-accent-soft hover:no-underline",
  } },
  compoundVariants: [{ source: ["manual", "minutes", "thread"], class: "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-bold" }],
});
type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeStyles>;

export function Badge({ className, source, ...props }: BadgeProps) {
  return <span {...props} className={badgeStyles({ source, className })} />;
}
