import { textStyles } from "../ui/styles";
import { useState } from "react";
import { ITEM_STATE_LABEL, type ItemState } from "../../lib/domain";
import { STATE_ICON } from "../domain";
import { Button, SegmentedButton, Icon, Input, Row, Segmented } from "../ui";
import type { Result } from "./request";

const CLOSE_HINT: Partial<Record<ItemState, string>> = {
  decided: "決まった内容を一言で。「決まったこと」の記録に残ります",
  live: "PMMT 当日の議題一覧に並びます",
  resolved: "返信で片付いた時に",
  deferred: "持ち越す理由など（任意）。「先送りした議題」の記録に残ります",
  open: "もう一度、未解決に戻します",
};

export function ClosePanel({ nextStates, run }: { nextStates: ItemState[]; run: (p: Record<string, unknown>) => Promise<Result> }) {
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
    <section data-slot="close-panel" className="rounded-card border border-border p-3">
      <Segmented role="group" aria-label="状態を変える">
        {nextStates.map((s) => (
          <SegmentedButton
            key={s}
            type="button"
            selected={chosen === s}
            onClick={() => {
              setChosen(chosen === s ? null : s);
              setError("");
            }}
          >
            <Icon name={s === "open" ? "arrow-go-back-line" : STATE_ICON(s)} />
            {s === "open" ? "未解決に戻す" : ITEM_STATE_LABEL[s]}
          </SegmentedButton>
        ))}
      </Segmented>
      {chosen && (
        <form
          data-slot="close-form" className="mt-3 flex flex-col gap-2 [&_p]:m-0"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <p className={textStyles({ role: "hint" })}>{CLOSE_HINT[chosen]}</p>
          {needsNote && (
            <Input
              type="text"
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={chosen === "decided" ? "例: 1 週間後ろにずらす。新しい期限は 11/20" : "任意"}
            />
          )}
          {error && <div className={textStyles({ role: "error" })}>{error}</div>}
          <Row>
            <span className="flex-1" />
            <Button type="submit"  variant="primary" disabled={pending}>
              {chosen === "open" ? "未解決に戻す" : `「${ITEM_STATE_LABEL[chosen]}」にする`}
            </Button>
          </Row>
        </form>
      )}
    </section>
  );
}
