import { tv } from "tailwind-variants";
import { Button, type ButtonProps } from "./Button";

export const iconButtonStyles = tv({
  base: "inline-flex items-center justify-center gap-1 rounded-control border-0 bg-transparent px-2 py-1 text-caption font-bold text-muted cursor-pointer hover:bg-surface-2 hover:text-text hover:no-underline [&_i]:text-lg",
  variants: { danger: { true: "hover:bg-red-soft hover:text-red" } },
});

export function IconButton({ className, danger, ...props }: ButtonProps) {
  return <Button {...props} variant="plain" className={iconButtonStyles({ danger, className })} />;
}
