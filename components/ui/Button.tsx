import { tv } from "./styles";
import { type VariantProps } from "tailwind-variants";
import type { ComponentProps } from "react";

export const buttonStyles = tv({
  base: "inline-flex items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 py-2 text-meta font-bold whitespace-nowrap text-text cursor-pointer hover:bg-surface-2 hover:no-underline disabled:cursor-default disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
  variants: {
    variant: {
      default: "",
      primary: "border-accent bg-accent text-white hover:bg-accent hover:brightness-106",
      ghost: "border-transparent bg-transparent text-text-2",
      plain: "justify-start gap-0 rounded-none border-0 bg-transparent p-0 text-inherit font-normal whitespace-normal hover:bg-transparent",
    },
    size: { default: "", small: "px-3 py-1 text-caption", big: "rounded-xl px-6 py-3 text-body", icon: "p-3 [&_i]:text-lg" },
    danger: { true: "text-red hover:bg-red-soft" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonStyles>;

export function Button({ variant, size, danger, className, ...props }: ButtonProps) {
  return <button {...props} className={buttonStyles({ variant, size, danger, className })} />;
}
