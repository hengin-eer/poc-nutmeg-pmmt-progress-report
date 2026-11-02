import { Link as RouterLink } from "@void/react";
import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type LinkProps = ComponentProps<typeof RouterLink>;

export function Link({ className, ...props }: LinkProps) {
  return <RouterLink {...props} className={twMerge("text-accent hover:underline", className)} />;
}
