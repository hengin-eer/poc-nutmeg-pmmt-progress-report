import { tv, type VariantProps } from "tailwind-variants";

const dot = tv({
  base: "inline-block size-2 shrink-0 rounded-full",
  variants: { tone: { green: "bg-green", yellow: "bg-yellow", red: "bg-red", neutral: "bg-border" } },
  defaultVariants: { tone: "neutral" },
});
export function Dot({ tone }: VariantProps<typeof dot>) {
  return <span className={dot({ tone })} />;
}
