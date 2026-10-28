import { Icon, IconButton } from "../ui";
import { useThread } from "./context";

/** スレッドを開くボタン（コメント数つき） */
type ThreadButtonProps = { id: number; comments?: number };

export function ThreadButton({ id, comments = 0 }: ThreadButtonProps) {
  const { open } = useThread();
    function handleOpenThread() { return open(id); }

  return (
    <IconButton type="button" className="icon-button" onClick={handleOpenThread} title="スレッドを開く" aria-label="スレッドを開く">
      <Icon name="chat-3-line" />
      {comments > 0 && <span>{comments}</span>}
    </IconButton>
  );
}
