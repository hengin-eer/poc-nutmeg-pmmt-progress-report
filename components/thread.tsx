import { Link, useRouter } from "@void/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { formatJst, ITEM_STATE_LABEL, type ItemState } from "../lib/domain";
import type { ThreadData } from "../lib/items";
import { Counts, CrossBureau, Icon, KIND_LABEL, KindIcon, STATE_ICON, StatePill } from "./ui";

// ---------- どの画面からでもスレッドを開けるようにする ----------

const ThreadContext = createContext<{ open: (id: number) => void }>({ open: () => {} });
export const useThread = () => useContext(ThreadContext);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = useCallback((id: number) => setOpenId(id), []);
  return (
    <ThreadContext.Provider value={{ open }}>
      {children}
      {openId !== null && <ThreadDrawer key={openId} id={openId} onClose={() => setOpenId(null)} />}
    </ThreadContext.Provider>
  );
}

/** スレッドを開くボタン（コメント数つき） */
export function ThreadButton({ id, comments = 0 }: { id: number; comments?: number }) {
  const { open } = useThread();
  return (
    <button type="button" className="icon-button" onClick={() => open(id)} title="スレッドを開く" aria-label="スレッドを開く">
      <Icon name="chat-3-line" />
      {comments > 0 && <span>{comments}</span>}
    </button>
  );
}

// ---------- 右から出るパネル ----------

function ThreadDrawer({ id, onClose }: { id: number; onClose: () => void }) {
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
          <button type="button" className="icon-button" onClick={close} title="閉じる（Esc）" aria-label="閉じる">
            <Icon name="close-line" />
          </button>
        </div>
        <div className="drawer-body">
          {failed ? (
            <p className="empty">読み込めませんでした</p>
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

// ---------- スレッドの中身（パネルと全画面で共通） ----------

type Result = { ok: true; data: ThreadData } | { ok: false; errors: Record<string, string> };

async function post(id: number, payload: Record<string, unknown>): Promise<Result> {
  const r = await fetch(`/api/items/${id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (r.ok || r.status === 422) return r.json();
  return { ok: false, errors: { _: "保存できませんでした。もう一度試してください" } };
}

export function ThreadView({ data, onChange }: { data: ThreadData; onChange: (d: ThreadData) => void }) {
  const { item, unit, cycle, thread, reactionSummary } = data;

  const run = async (payload: Record<string, unknown>) => {
    const res = await post(item.id, payload);
    if (res.ok) onChange(res.data);
    return res;
  };

  return (
    <article className="thread">
      <header className="thread-head">
        <div className="row">
          <KindIcon kind={item.kind} />
          <Link href={`/units/${unit.id}`} className="thread-unit">
            {unit.name}
          </Link>
          <StatePill state={item.state} />
          <CrossBureau on={item.crossBureau} />
        </div>
        <div className="meta">
          {data.authorName} ・ {formatJst(item.createdAt)}
          <span className="hide-sm"> ・ {formatJst(cycle.meetingAt)} の PMMT</span>
        </div>
      </header>

      <p className="thread-body">{item.body}</p>

      {item.resolutionNote && (
        <div className={`resolution state-${item.state}`}>
          <Icon name={STATE_ICON(item.state)} />
          <div>
            <strong>{ITEM_STATE_LABEL[item.state]}</strong>
            <div>{item.resolutionNote}</div>
            {data.closedByName && <div className="meta">{data.closedByName}</div>}
          </div>
        </div>
      )}

      <div className="reactions">
        {reactionSummary.map((r) => (
          <button
            key={r.emoji}
            type="button"
            className={`reaction ${r.mine ? "mine" : ""} ${r.count ? "" : "zero"}`}
            title={r.names.join("、") || "リアクションする"}
            onClick={() => run({ op: "react", emoji: r.emoji })}
          >
            {r.emoji}
            {r.count > 0 && <span>{r.count}</span>}
          </button>
        ))}
      </div>

      {data.canClose && <ClosePanel key={item.state} nextStates={data.nextStates} run={run} />}

      <section className="comments">
        <h3>
          コメント <span className="count">{thread.length}</span>
        </h3>
        {thread.length === 0 ? (
          <p className="empty">まだコメントはありません</p>
        ) : (
          <ul className="comment-list">
            {thread.map((t) => (
              <li key={t.id}>
                <div className="avatar" aria-hidden="true">
                  {t.author.slice(0, 1)}
                </div>
                <div>
                  <div className="row comment-head">
                    <strong>{t.author}</strong>
                    <span className="meta">{formatJst(t.createdAt)}</span>
                  </div>
                  <div className="body">{t.body}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <CommentForm run={run} />
      </section>
    </article>
  );
}

function CommentForm({ run }: { run: (p: Record<string, unknown>) => Promise<Result> }) {
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
      <button type="submit" className="primary icon-only" disabled={pending || !body.trim()} aria-label="送信" title="送信">
        <Icon name="send-plane-2-fill" />
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

const CLOSE_HINT: Partial<Record<ItemState, string>> = {
  decided: "決まった内容を一言で。「決まったこと」の記録に残ります",
  live: "PMMT 当日の議題一覧に並びます",
  resolved: "返信で片付いた時に",
  deferred: "持ち越す理由など（任意）。「先送りした議題」の記録に残ります",
  open: "もう一度、未解決に戻します",
};

function ClosePanel({ nextStates, run }: { nextStates: ItemState[]; run: (p: Record<string, unknown>) => Promise<Result> }) {
  const [chosen, setChosen] = useState<ItemState | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const needsNote = chosen === "decided" || chosen === "deferred" || chosen === "resolved";

  const submit = async () => {
    setPending(true);
    const res = await run({ op: "close", state: chosen, note });
    setPending(false);
    if (!res.ok) setError(Object.values(res.errors)[0] ?? "");
  };

  return (
    <section className="close-panel">
      <div className="segmented" role="group" aria-label="状態を変える">
        {nextStates.map((s) => (
          <button
            key={s}
            type="button"
            className={chosen === s ? "selected" : ""}
            onClick={() => {
              setChosen(chosen === s ? null : s);
              setError("");
            }}
          >
            <Icon name={s === "open" ? "arrow-go-back-line" : STATE_ICON(s)} />
            {s === "open" ? "未解決に戻す" : ITEM_STATE_LABEL[s]}
          </button>
        ))}
      </div>
      {chosen && (
        <form
          className="close-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <p className="hint">{CLOSE_HINT[chosen]}</p>
          {needsNote && (
            <input
              type="text"
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={chosen === "decided" ? "例: 1 週間後ろにずらす。新しい期限は 11/20" : "任意"}
            />
          )}
          {error && <div className="error">{error}</div>}
          <div className="row">
            <span className="spacer" />
            <button type="submit" className="primary" disabled={pending}>
              {chosen === "open" ? "未解決に戻す" : `「${ITEM_STATE_LABEL[chosen]}」にする`}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

// ---------- 一覧の 1 行（押すとスレッドが開く） ----------

export type ItemSummary = {
  id: number;
  kind: "confirm" | "talk";
  state: ItemState;
  body: string;
  crossBureau: boolean;
  unitName?: string;
  resolutionNote?: string | null;
  comments?: number;
  reactions?: number;
};

export function ItemRow({ item, showState = true }: { item: ItemSummary; showState?: boolean }) {
  const { open } = useThread();
  return (
    <li className="item-li">
      <button type="button" className="item-row" onClick={() => open(item.id)}>
        <KindIcon kind={item.kind} />
        <div>
          {item.unitName && <div className="item-unit">{item.unitName}</div>}
          <div className="item-body">{item.body}</div>
          {item.resolutionNote && (
            <div className="item-note">
              <Icon name="corner-down-right-line" />
              {item.resolutionNote}
            </div>
          )}
        </div>
        <div className="item-side">
          <div className="row">
            <CrossBureau on={item.crossBureau} />
            {showState && <StatePill state={item.state} />}
          </div>
          <Counts comments={item.comments ?? 0} reactions={item.reactions ?? 0} />
        </div>
      </button>
    </li>
  );
}
