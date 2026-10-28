import { twMerge } from "./styles";

/** Remix Icon。name は ri- を除いた名前。 */
type IconProps = { name: string; className?: string; label?: string };

export function Icon({ name, className, label }: IconProps) {
  const iconAriaHidden = label ? undefined : true;
  const iconRole = label ? "img" : undefined;

  return <i className={twMerge(`ri-${name} text-[1.1em] leading-none align-[-0.12em]`, className)} aria-hidden={iconAriaHidden} aria-label={label} role={iconRole} />;
}
