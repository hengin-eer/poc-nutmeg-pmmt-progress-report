import type { ComponentProps } from "react";
import { twMerge } from "./styles";

type SegmentedProps = ComponentProps<"div">;

export function Segmented({ className, ...props }: SegmentedProps) {
  return <div {...props} data-slot="segmented" className={twMerge("flex flex-wrap gap-2", className)} />;
}
