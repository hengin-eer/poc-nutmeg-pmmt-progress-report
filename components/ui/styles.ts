import { createTV } from "tailwind-variants";
import { extendTailwindMerge } from "tailwind-merge";

// Register custom theme names so font sizes and text colors never cancel each other.
const theme = {
  text: ["display", "title", "heading", "subheading", "body", "meta", "caption"],
  radius: ["card", "control"],
  shadow: ["card", "panel"],
  spacing: ["sidebar"],
};
export const tv = createTV({ twMergeConfig: { extend: { theme } } });
export const twMerge = extendTailwindMerge({ extend: { theme } });

export const textStyles = tv({
  variants: {
    role: {
      eyebrow: "mb-1 text-caption font-semibold text-muted",
      meta: "text-caption text-muted",
      hint: "text-caption font-normal text-muted",
      error: "mt-2 text-caption text-red",
      lead: "text-body text-text-2",
    },
  },
});
export const headingStyles = tv({
  base: "text-text",
  variants: { level: {
    title: "text-title font-extrabold tracking-[.01em]",
    heading: "text-heading font-bold",
    subheading: "text-subheading font-bold",
  } },
});
