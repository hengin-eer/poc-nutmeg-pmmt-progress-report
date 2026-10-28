import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  variants: {
    variant: { primary: "primary", ghost: "ghost" },
    size: { small: "small", big: "big" },
  },
});

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof button>;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button {...props} className={variant || size ? button({ variant, size, className }) : className} />;
}
