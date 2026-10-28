import { twMerge } from "tailwind-merge";

/** Remix Icon。name は ri- を除いた名前。 */
export function Icon({ name, className, label }: { name: string; className?: string; label?: string }) {
  return <i className={twMerge(`ri-${name} text-[1.1em] leading-none align-[-0.12em]`, className)} aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} />;
}
