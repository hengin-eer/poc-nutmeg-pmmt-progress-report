import { tv } from "./styles";

import { Button, type ButtonProps } from "./Button";

const choice = tv({
  base: "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-meta font-semibold text-text-2 [&_i]:text-lg",
  variants: { selected: { true: "border-accent bg-accent-soft text-accent hover:bg-accent-soft [&_[data-on=false]]:bg-accent/20" } },
});
export function Choice({ selected, className, ...props }: ButtonProps & { selected?: boolean }) {
  return <Button {...props} aria-pressed={selected} className={choice({ selected, className })} />;
}
