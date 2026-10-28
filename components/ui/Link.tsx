import { twMerge } from "./styles";
import { Link as RouterLink } from "@void/react";
import type { ComponentProps } from "react";

export function Link({ className, ...props }: ComponentProps<typeof RouterLink>) {
  return <RouterLink {...props} className={twMerge("text-accent hover:underline", className)} />;
}
