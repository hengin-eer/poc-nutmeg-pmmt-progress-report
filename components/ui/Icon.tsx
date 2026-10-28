/** Remix Icon（https://remixicon.com）。name は "ri-" を除いた名前 */
type IconProps = { name: string; className?: string; label?: string };

export function Icon({ name, className = "", label }: IconProps) {
  return <i className={`ri-${name} icon ${className}`} aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} />;
}

