import { buttonStyles } from "./Button";
import { Link } from "./Link";
import type { ComponentProps } from "react";
import type { VariantProps } from "tailwind-variants";

export function ButtonLink({ className, variant, size, danger, ...props }: ComponentProps<typeof Link> & VariantProps<typeof buttonStyles>) {
  return <Link {...props} className={buttonStyles({ variant, size, danger, className })} />;
}
