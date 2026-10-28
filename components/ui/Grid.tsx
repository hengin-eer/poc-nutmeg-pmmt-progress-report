import type { ComponentProps } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "./styles";

const grid = tv({
  base: "grid gap-6",
  variants: { columns: {
    two: "grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start max-sm:grid-cols-1",
    cards: "grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4",
  } },
});
type GridProps = ComponentProps<"div"> & VariantProps<typeof grid>;

export function Grid({ columns, className, ...props }: GridProps) {
  return <div {...props} className={grid({ columns, className })} />;
}
