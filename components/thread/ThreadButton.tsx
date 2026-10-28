import { Icon, IconButton } from "../ui";
import { useThread } from "./context";

/** スレッドを開くボタン（コメント数つき） */
export function ThreadButton({ id, comments = 0 }: { id: number; comments?: number }) {
  const { open } = useThread();
  return (
    <IconButton type="button"  onClick={() => open(id)} title="スレッドを開く" aria-label="スレッドを開く">
      <Icon name="chat-3-line" />
      {comments > 0 && <span>{comments}</span>}
    </IconButton>
  );
}
