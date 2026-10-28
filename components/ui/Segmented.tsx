import type { ComponentProps } from "react";
import { withBase } from "./classes";

type SegmentedProps = ComponentProps<"div">;

export function Segmented({ className, ...props }: SegmentedProps) {
  return <div {...props} className={withBase("segmented", className)} />;
}
