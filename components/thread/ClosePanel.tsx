import { useState } from "react";
import { ITEM_STATE_LABEL, type ItemState } from "../../lib/domain";
import { STATE_ICON } from "../domain";
import { Button, Icon, Segmented } from "../ui";
import type { Result } from "./request";

const CLOSE_HINT: Partial<Record<ItemState, string>> = {
  decided: "決まった内容を一言で。「決まったこと」の記録に残ります",
  live: "PMMT 当日の議題一覧に並びます",
  resolved: "返信で片付いた時に",
  deferred: "持ち越す理由など（任意）。「先送りした議題」の記録に残ります",
  open: "もう一度、未解決に戻します",
};

type ClosePanelProps = { nextStates: ItemState[]; run: (p: Record<string, unknown>) => Promise<Result> };

export function ClosePanel({ nextStates, run }: ClosePanelProps) {
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
      <Segmented className="segmented" role="group" aria-label="状態を変える">
        {nextStates.map((s) => (
          <Button
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
          </Button>
        ))}
      </Segmented>
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
            <Button type="submit" className="primary" disabled={pending}>
              {chosen === "open" ? "未解決に戻す" : `「${ITEM_STATE_LABEL[chosen]}」にする`}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
