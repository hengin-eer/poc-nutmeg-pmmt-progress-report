import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Button, Icon, Textarea } from "../ui";
import { textStyles } from "../ui/styles";
import { type Result } from "./request";

type CommentFormProps = { run: (p: Record<string, unknown>) => Promise<Result> };

export function CommentForm({ run }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isCommentSubmissionDisabled = pending || !body.trim();

  async function submit() {
    if (pending) return;
    setPending(true);
    const res = await run({ op: "comment", body });
    setPending(false);
    if (res.ok) {
      setBody("");
      setError("");
    } else setError(Object.values(res.errors)[0] ?? "");
  }

  function handleSubmitComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleCommentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value);
  }

  function handleCommentKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
  }

  return (
    <form
      className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 [&_textarea]:min-h-12 [&_[role=alert]]:col-span-full"
      onSubmit={handleSubmitComment}
    >
      <Textarea
        value={body}
        onChange={handleCommentChange}
        onKeyDown={handleCommentKeyDown}
        placeholder="コメントする（Ctrl + Enter で送信）"
        rows={2}
      />
      <Button type="submit" variant="primary" size="icon" disabled={isCommentSubmissionDisabled} aria-label="送信" title="送信">
        <Icon name="send-plane-2-fill" />
      </Button>
      {error && <div className={textStyles({ role: "error" })}>{error}</div>}
    </form>
  );
}
