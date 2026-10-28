import assert from "node:assert/strict";
import { test } from "node:test";
import { tv, twMerge } from "../components/ui/styles.ts";

test("custom text sizes coexist with colors and override other sizes", () => {
  assert.equal(twMerge("text-meta text-muted"), "text-meta text-muted");
  assert.equal(twMerge("text-meta text-muted", "text-body"), "text-muted text-body");
});

test("variants and slots preserve custom theme sizes and colors", () => {
  const component = tv({
    slots: { label: "text-meta text-text", card: "rounded-card shadow-card" },
    variants: { selected: { true: { label: "text-accent", card: "shadow-none" } } },
  });
  const styles = component({ selected: true });
  assert.equal(styles.label(), "text-meta text-accent");
  assert.equal(styles.card(), "rounded-card shadow-none");
  assert.equal(twMerge("rounded-card", "rounded-control"), "rounded-control");
});
