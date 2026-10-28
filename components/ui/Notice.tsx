import type { ComponentProps } from "react";
import { type VariantProps } from "tailwind-variants";
import { tv } from "./styles";

const notice = tv({
  base: "m-0 flex items-center gap-2 rounded-xl px-4 py-3 text-meta font-semibold [&_i]:text-lg",
  variants: { tone: { notice: "bg-green-soft text-green", warn: "bg-yellow-soft text-yellow", info: "bg-accent-soft text-accent" } },
  defaultVariants: { tone: "notice" },
});
type NoticeProps = ComponentProps<"p"> & VariantProps<typeof notice>;

export function Notice({ tone, className, ...props }: NoticeProps) {
  return <p {...props} className={notice({ tone, className })} />;
}
