import { useRouter } from "@void/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ThreadData } from "../../lib/items";
import { KIND_LABEL } from "../domain";
import { EmptyState, iconButtonStyles, Icon, IconButton, Link } from "../ui";
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
    <div data-slot="drawer-root" className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="スレッド">
      <div className="absolute inset-0 animate-fade bg-overlay/35" onClick={close} />
      <aside data-slot="drawer" className="absolute inset-y-0 right-0 flex w-[min(600px,100vw)] animate-drawer flex-col bg-surface shadow-panel max-md:top-[8vh] max-md:w-screen max-md:animate-sheet max-md:rounded-t-[20px]">
        <div className="flex items-center gap-1 border-b border-border py-4 pr-4 pl-6 max-md:pl-4">
          <span className="flex items-center gap-2 text-caption font-bold text-muted">
            {data ? (
              <>
                <Icon name={data.item.kind === "confirm" ? "question-answer-line" : "chat-smile-2-line"} />
                {KIND_LABEL[data.item.kind]}
              </>
            ) : (
              "スレッド"
            )}
          </span>
          <span className="flex-1" />
          <Link className={iconButtonStyles()} href={`/items/${id}`}  title="全画面で開く" aria-label="全画面で開く" onClick={onClose}>
            <Icon name="external-link-line" />
          </Link>
          <IconButton type="button"  onClick={close} title="閉じる（Esc）" aria-label="閉じる">
            <Icon name="close-line" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 max-md:px-4">
          {failed ? (
            <EmptyState>読み込めませんでした</EmptyState>
          ) : data ? (
            <ThreadView
              data={data}
              onChange={(d) => {
                changed.current = true;
                setData(d);
              }}
            />
          ) : (
            <div className="h-50 animate-shimmer rounded-xl bg-linear-to-r from-surface-2 via-surface to-surface-2 bg-size-[200%_100%]" />
          )}
        </div>
      </aside>
    </div>
  );
}
