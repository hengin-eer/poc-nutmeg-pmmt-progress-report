import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const flow = tv({
  base: "flex",
  variants: {
    direction: { row: "flex-wrap items-center", column: "flex-col" },
    gap: { 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6", 8: "gap-8" },
  },
});
type Props = ComponentProps<"div"> & Omit<VariantProps<typeof flow>, "direction">;
export function Row({ gap = 2, className, ...props }: Props) {
  return <div {...props} className={flow({ direction: "row", gap, className })} />;
}
export function Stack({ gap = 4, className, ...props }: Props) {
  return <div {...props} className={flow({ direction: "column", gap, className })} />;
}
