import { useState } from "react";
import { Button, Icon } from "../ui";
import type { Result } from "./request";

type CommentFormProps = { run: (p: Record<string, unknown>) => Promise<Result> };

export function CommentForm({ run }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (pending) return;
    setPending(true);
    const res = await run({ op: "comment", body });
    setPending(false);
    if (res.ok) {
      setBody("");
      setError("");
    } else setError(Object.values(res.errors)[0] ?? "");
  };

  return (
    <form
      className="comment-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder="コメントする（Ctrl + Enter で送信）"
        rows={2}
      />
      <Button type="submit" className="primary icon-only" disabled={pending || !body.trim()} aria-label="送信" title="送信">
        <Icon name="send-plane-2-fill" />
      </Button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
