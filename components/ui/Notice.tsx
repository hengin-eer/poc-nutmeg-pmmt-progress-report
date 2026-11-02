import type { ComponentProps } from "react";

type NoticeProps = ComponentProps<"p"> & { tone?: "notice" | "warn" | "info" };

export function Notice({ tone = "notice", className, ...props }: NoticeProps) {
  const noticeClassName = className ?? tone;

  return <p {...props} className={noticeClassName} />;
}
