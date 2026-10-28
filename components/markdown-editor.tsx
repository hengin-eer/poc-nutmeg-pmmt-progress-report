import { useRef, useState } from "react";
import { Markdown } from "./markdown";
import { Button, EmptyState, Field, Icon } from "./ui";


export function MarkdownEditor({ id, label, hint, value, onChange, placeholder, error }: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  const [preview, setPreview] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <Field className="field">
      <div className="field-label">
        <label id={`${id}-label`} htmlFor={id}>{label}</label>
        <span id={`${id}-hint`} className="hint">{hint}</span>
      </div>
      <div className="markdown-editor">
        <div className="markdown-editor-header" role="tablist" aria-label={`${label}の表示切り替え`}>
          {([false, true] as const).map((isPreview, index) => (
            <Button
              key={String(isPreview)} ref={(node) => { tabs.current[index] = node; }}
              type="button" role="tab" id={`${id}-tab-${index}`}
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
          <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} aria-invalid={!!error} />
        </div>
        <div id={`${id}-preview`} hidden={!preview} className="markdown-preview" role="tabpanel"
          aria-labelledby={`${id}-tab-1`} tabIndex={0}>
          {preview && (value.trim() ? <Markdown>{value}</Markdown> : <EmptyState className="empty">まだ記入されていません</EmptyState>)}
        </div>
      </div>
      {error && <div id={`${id}-error`} className="error">{error}</div>}
    </Field>
  );
}
