import type { ChangeEvent, FormEvent } from "react";
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

  function handleSelectResolution(s: (typeof nextStates)[number]) {
    setChosen(chosen === s ? null : s);
    setError("");
  }

  function handleSubmitResolution(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleResolutionNoteChange(e: ChangeEvent<HTMLInputElement>) { return setNote(e.target.value); }

  function getResolutionChoiceClass(s: (typeof nextStates)[number]) { return chosen === s ? "selected" : ""; }
  function getResolutionChoiceIcon(s: (typeof nextStates)[number]) {
    return s === "open" ? "arrow-go-back-line" : STATE_ICON(s);
  }
  function getResolutionChoiceLabel(s: (typeof nextStates)[number]) {
    return s === "open" ? "未解決に戻す" : ITEM_STATE_LABEL[s];
  }
  const resolutionPlaceholder = chosen === "decided" ? "例: 1 週間後ろにずらす。新しい期限は 11/20" : "任意";
  const selectedStateLabel = chosen ? ITEM_STATE_LABEL[chosen] : "";
  const resolutionSubmitLabel = chosen === "open" ? "未解決に戻す" : `「${selectedStateLabel}」にする`;

  return (
    <section className="close-panel">
      <Segmented className="segmented" role="group" aria-label="状態を変える">
        {nextStates.map((s) => (
          <Button
            key={s}
            type="button"
            className={getResolutionChoiceClass(s)}
            onClick={() => handleSelectResolution(s)}
          >
            <Icon name={getResolutionChoiceIcon(s)} />
            {getResolutionChoiceLabel(s)}
          </Button>
        ))}
      </Segmented>
      {chosen && (
        <form
          className="close-form"
          onSubmit={handleSubmitResolution}
        >
          <p className="hint">{CLOSE_HINT[chosen]}</p>
          {needsNote && (
            <input
              type="text"
              autoFocus
              value={note}
              onChange={handleResolutionNoteChange}
              placeholder={resolutionPlaceholder}
            />
          )}
          {error && <div className="error">{error}</div>}
          <div className="row">
            <span className="spacer" />
            <Button type="submit" className="primary" disabled={pending}>
              {resolutionSubmitLabel}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
