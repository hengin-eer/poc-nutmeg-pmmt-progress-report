import { FieldLabel } from "./ui";
import { textStyles, tv } from "./ui/styles";

import { useRef, useState } from "react";
import { Markdown } from "./markdown";
import { Button, EmptyState, Field, Icon, Label, Textarea } from "./ui";

const editor = tv({
  slots: {
    root: "rounded-control border border-border bg-surface outline-3 outline-transparent transition-colors focus-within:border-accent focus-within:outline-accent-soft",
    header: "flex gap-1 rounded-t-control border-b border-border bg-surface-2 px-2 pt-2",
    panel: "min-h-40 w-full rounded-b-control border-0 bg-surface p-3 leading-[1.7] focus:outline-none",
  },
});
const editorTab = tv({
  base: "-mb-px gap-2 rounded-t-lg rounded-b-none border border-transparent bg-transparent px-3 py-2 text-meta font-bold text-muted transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-4",
  variants: { selected: { true: "border-border border-b-surface bg-surface text-text" } },
});

export function MarkdownEditor({ id, label, hint, value, onChange, placeholder, error }: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  const styles = editor();
  const [preview, setPreview] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <Field>
      <FieldLabel>
        <Label id={`${id}-label`} htmlFor={id}>{label}</Label>
        <span id={`${id}-hint`} className={textStyles({ role: "hint" })}>{hint}</span>
      </FieldLabel>
      <div data-slot="markdown-editor" className={styles.root()}>
        <div className={styles.header()} role="tablist" aria-label={`${label}の表示切り替え`}>
          {([false, true] as const).map((isPreview, index) => (
            <Button
              key={String(isPreview)} ref={(node) => { tabs.current[index] = node; }}
              variant="plain" className={editorTab({ selected: preview === isPreview })} type="button" role="tab" id={`${id}-tab-${index}`}
              aria-selected={preview === isPreview} tabIndex={preview === isPreview ? 0 : -1}
              aria-controls={isPreview ? `${id}-preview` : `${id}-write`}
              onClick={() => setPreview(isPreview)}
              onKeyDown={(event) => {
                let target: number;
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") target = 1 - index;
                else if (event.key === "Home") target = 0;
                else if (event.key === "End") target = 1;
                else return;
                event.preventDefault();
                setPreview(target === 1);
                tabs.current[target]?.focus();
              }}
            >
              <Icon name={isPreview ? "eye-line" : "edit-line"} />
              {isPreview ? "プレビュー" : "書く"}
            </Button>
          ))}
        </div>
        <div id={`${id}-write`} role="tabpanel" aria-labelledby={`${id}-tab-0`} hidden={preview}>
          <Textarea className={styles.panel({ className: "block min-h-40 focus:outline-none" })} id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} aria-invalid={!!error} />
        </div>
        <div id={`${id}-preview`} hidden={!preview} data-slot="markdown-preview" className={styles.panel()} role="tabpanel"
          aria-labelledby={`${id}-tab-1`} tabIndex={0}>
          {preview && (value.trim() ? <Markdown>{value}</Markdown> : <EmptyState>まだ記入されていません</EmptyState>)}
        </div>
      </div>
      {error && <div id={`${id}-error`} className={textStyles({ role: "error" })}>{error}</div>}
    </Field>
  );
}
