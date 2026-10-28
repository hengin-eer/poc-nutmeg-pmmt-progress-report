import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const card = tv({
  base: "rounded-card border border-border bg-surface p-6 shadow-card max-sm:p-4",
  variants: { size: { normal: "", large: "p-8" } },
});
type Props = HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" } & VariantProps<typeof card>;

export function Card({ as: Tag = "div", className, size, ...props }: Props) {
  return <Tag {...props} data-slot="card" className={card({ size, className })} />;
}
