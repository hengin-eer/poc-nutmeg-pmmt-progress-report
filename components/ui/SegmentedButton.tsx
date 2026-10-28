import { Button, type ButtonProps } from "./Button";
import { tv } from "./styles";

const segment = tv({
  base: "rounded-control border border-transparent bg-surface-2 px-3 py-2 text-meta text-text-2 hover:bg-surface-2",
  variants: { selected: { true: "bg-text text-bg hover:bg-text" } },
});
type SegmentedButtonProps = ButtonProps & { selected?: boolean };

export function SegmentedButton({ selected, className, ...props }: SegmentedButtonProps) {
  return <Button {...props} variant="plain" className={segment({ selected, className })} />;
}
