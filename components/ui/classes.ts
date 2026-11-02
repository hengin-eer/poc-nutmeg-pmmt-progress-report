/** 既存 CSS のクラス名と順序を保ちつつ、基本クラスを補う。 */
export function withBase(base: string, className?: string) {
  return className?.split(/\s+/).includes(base) ? className : [base, className].filter(Boolean).join(" ");
}
