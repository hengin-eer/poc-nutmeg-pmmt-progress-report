import { tv } from "./styles";
import { Button, type ButtonProps } from "./Button";

const segment = tv({
  base: "rounded-control border border-transparent bg-surface-2 px-3 py-2 text-meta text-text-2 hover:bg-surface-2",
  variants: { selected: { true: "bg-text text-bg hover:bg-text" } },
});
export function SegmentedButton({ selected, className, ...props }: ButtonProps & { selected?: boolean }) {
  return <Button {...props} variant="plain" className={segment({ selected, className })} />;
}
