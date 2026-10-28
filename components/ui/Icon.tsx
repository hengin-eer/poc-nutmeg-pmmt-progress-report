/** Remix Icon（https://remixicon.com）。name は "ri-" を除いた名前 */
export function Icon({ name, className = "", label }: { name: string; className?: string; label?: string }) {
  return <i className={`ri-${name} icon ${className}`} aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} />;
}

