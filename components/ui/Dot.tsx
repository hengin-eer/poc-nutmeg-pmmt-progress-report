import { type VariantProps } from "tailwind-variants";
import { tv } from "./styles";

const dot = tv({
  base: "inline-block size-2 shrink-0 rounded-full",
  variants: { tone: { green: "bg-green", yellow: "bg-yellow", red: "bg-red", neutral: "bg-border" } },
  defaultVariants: { tone: "neutral" },
});
type DotProps = VariantProps<typeof dot>;

export function Dot({ tone }: DotProps) {
  return <span className={dot({ tone })} />;
}
