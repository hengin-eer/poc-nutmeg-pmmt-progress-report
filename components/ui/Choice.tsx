import { Button, type ButtonProps } from "./Button";
import { tv } from "./styles";

const choice = tv({
  base: "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-meta font-semibold text-text-2 [&_i]:text-lg",
  variants: { selected: { true: "border-accent bg-accent-soft text-accent hover:bg-accent-soft [&_[data-on=false]]:bg-accent/20" } },
});
type ChoiceProps = ButtonProps & { selected?: boolean };

export function Choice({ selected, className, ...props }: ChoiceProps) {
  return <Button {...props} aria-pressed={selected} className={choice({ selected, className })} />;
}
