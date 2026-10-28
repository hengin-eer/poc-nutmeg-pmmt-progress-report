import { Link, useRouter } from "@void/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ThreadData } from "../../lib/items";
import { KIND_LABEL } from "../domain";
import { EmptyState, Icon, IconButton } from "../ui";
import { ThreadView } from "./ThreadView";

export function ThreadDrawer({ id, onClose }: { id: number; onClose: () => void }) {
  const router = useRouter();
  const [data, setData] = useState<ThreadData | null>(null);
  const [failed, setFailed] = useState(false);
  const changed = useRef(false);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((r) => (r.ok ? (r.json() as Promise<ThreadData>) : Promise.reject()))
      .then(setData)
      .catch(() => setFailed(true));
  }, [id]);

  const close = useCallback(() => {
    onClose();
    // 件数や状態が変わっていたら、後ろの画面も読み直す
    if (changed.current) router.refresh({ preserveScroll: true });
  }, [onClose, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [close]);

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label="スレッド">
      <div className="drawer-backdrop" onClick={close} />
      <aside className="drawer">
        <div className="drawer-bar">
          <span className="drawer-title">
            {data ? (
              <>
                <Icon name={data.item.kind === "confirm" ? "question-answer-line" : "chat-smile-2-line"} />
                {KIND_LABEL[data.item.kind]}
              </>
            ) : (
              "スレッド"
            )}
          </span>
          <span className="spacer" />
          <Link href={`/items/${id}`} className="icon-button" title="全画面で開く" aria-label="全画面で開く" onClick={onClose}>
            <Icon name="external-link-line" />
          </Link>
          <IconButton type="button" className="icon-button" onClick={close} title="閉じる（Esc）" aria-label="閉じる">
            <Icon name="close-line" />
          </IconButton>
        </div>
        <div className="drawer-body">
          {failed ? (
            <EmptyState className="empty">読み込めませんでした</EmptyState>
          ) : data ? (
            <ThreadView
              data={data}
              onChange={(d) => {
                changed.current = true;
                setData(d);
              }}
            />
          ) : (
            <div className="skeleton" />
          )}
        </div>
      </aside>
    </div>
  );
}
