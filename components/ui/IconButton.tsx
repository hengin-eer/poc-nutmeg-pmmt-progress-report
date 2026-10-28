import { twMerge } from "tailwind-merge";
import { Button, type ButtonProps } from "./Button";
import { withBase } from "./classes";

export function IconButton({ className, ...props }: ButtonProps) {
  return <Button {...props} className={twMerge(withBase("icon-button", className))} />;
}
