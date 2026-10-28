/** Remix Icon（https://remixicon.com）。name は "ri-" を除いた名前 */
type IconProps = { name: string; className?: string; label?: string };

export function Icon({ name, className = "", label }: IconProps) {
  const isDecorativeIcon = label ? undefined : true;
  const iconRole = label ? "img" : undefined;

  return <i className={`ri-${name} icon ${className}`} aria-hidden={isDecorativeIcon} aria-label={label} role={iconRole} />;
}

