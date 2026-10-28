import { useState } from "react";
import { Markdown } from "./markdown";
import { Icon } from "./ui";

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
  return (
    <div className="field">
      <div className="field-label">
        <label id={`${id}-label`} htmlFor={id}>{label}</label>
        <span id={`${id}-hint`} className="hint">{hint}</span>
      </div>
      <div className="segmented markdown-switch" role="group" aria-label={`${label}の表示切り替え`}>
        <button type="button" className={!preview ? "selected" : ""} aria-pressed={!preview} aria-controls={id} onClick={() => setPreview(false)}>
          <Icon name="edit-line" />書く
        </button>
        <button type="button" className={preview ? "selected" : ""} aria-pressed={preview} aria-controls={`${id}-preview`} onClick={() => setPreview(true)}>
          <Icon name="eye-line" />プレビュー
        </button>
        <span className="hint">Markdown で書けます</span>
      </div>
      <textarea id={id} hidden={preview} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} aria-invalid={!!error} />
      <div id={`${id}-preview`} hidden={!preview} className="markdown-preview" role="region" aria-labelledby={`${id}-label`}>
        {preview && (value.trim() ? <Markdown>{value}</Markdown> : <p className="empty">まだ記入されていません</p>)}
      </div>
      {error && <div id={`${id}-error`} className="error">{error}</div>}
    </div>
  );
}
