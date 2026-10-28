import type { HTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";
import { tv } from "./styles";

const card = tv({
  base: "rounded-card border border-border bg-surface p-6 shadow-card max-sm:p-4",
  variants: { size: { normal: "", large: "p-8" } },
});
type CardProps = HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" } & VariantProps<typeof card>;

export function Card({ as: Tag = "div", className, size, ...props }: CardProps) {
  return <Tag {...props} data-slot="card" className={card({ size, className })} />;
}
