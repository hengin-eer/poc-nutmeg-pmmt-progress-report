import { tv } from "./styles";
import { type VariantProps } from "tailwind-variants";
import type { ComponentProps } from "react";

export const flowStyles = tv({
  base: "flex",
  variants: {
    direction: { row: "flex-wrap items-center", column: "flex-col", wrap: "flex-wrap" },
    gap: { 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6", 8: "gap-8" },
  },
});
type Props = ComponentProps<"div"> & Omit<VariantProps<typeof flowStyles>, "direction">;
export function Row({ gap = 2, className, ...props }: Props) {
  return <div {...props} className={flowStyles({ direction: "row", gap, className })} />;
}
export function Stack({ gap = 4, className, ...props }: Props) {
  return <div {...props} className={flowStyles({ direction: "column", gap, className })} />;
}
