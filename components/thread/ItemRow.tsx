import { type ItemState } from "../../lib/domain";
import { Counts, CrossBureau, KindIcon, StatePill } from "../domain";
import { Button, Icon, Row } from "../ui";
import { useThread } from "./context";

type ItemRowProps = { item: ItemSummary; showState?: boolean };

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

export function ItemRow({ item, showState = true }: ItemRowProps) {
  const { open } = useThread();
  const hasUnitName = Boolean(item.unitName);
  const hasResolutionNote = Boolean(item.resolutionNote);
  const commentCount = item.comments ?? 0;
  const reactionCount = item.reactions ?? 0;

  function handleOpenThread() {
    open(item.id);
  }

  return (
    <li data-slot="item">
      <Button type="button" variant="plain" data-slot="item-row" className="grid w-full box-content grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 -mx-3 rounded-xl p-3 text-left text-inherit hover:bg-surface-2" onClick={handleOpenThread}>
        <KindIcon kind={item.kind} />
        <div>
          {hasUnitName && <div className="text-meta font-bold">{item.unitName}</div>}
          <div className="mt-1 line-clamp-3 whitespace-pre-wrap leading-relaxed text-text">{item.body}</div>
          {hasResolutionNote && (
            <div className="mt-1 flex gap-1 text-caption text-text-2">
              <Icon name="corner-down-right-line" />
              {item.resolutionNote}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Row>
            <CrossBureau on={item.crossBureau} />
            {showState && <StatePill state={item.state} />}
          </Row>
          <Counts comments={commentCount} reactions={reactionCount} />
        </div>
      </Button>
    </li>
  );
}
