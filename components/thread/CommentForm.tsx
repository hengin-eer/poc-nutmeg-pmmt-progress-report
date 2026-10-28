import { textStyles } from "../ui/styles";
import { useState } from "react";
import { Button, Icon, Textarea } from "../ui";
import type { Result } from "./request";

export function CommentForm({ run }: { run: (p: Record<string, unknown>) => Promise<Result> }) {
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
      className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 [&_textarea]:min-h-12 [&_[role=alert]]:col-span-full"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder="コメントする（Ctrl + Enter で送信）"
        rows={2}
      />
      <Button type="submit" variant="primary" size="icon" disabled={pending || !body.trim()} aria-label="送信" title="送信">
        <Icon name="send-plane-2-fill" />
      </Button>
      {error && <div className={textStyles({ role: "error" })}>{error}</div>}
    </form>
  );
}
