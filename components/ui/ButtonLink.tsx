import type { ComponentProps } from "react";
import type { VariantProps } from "tailwind-variants";
import { buttonStyles } from "./Button";
import { Link } from "./Link";

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonStyles>;

export function ButtonLink({ className, variant, size, danger, ...props }: ButtonLinkProps) {
  return <Link {...props} className={buttonStyles({ variant, size, danger, className })} />;
}
