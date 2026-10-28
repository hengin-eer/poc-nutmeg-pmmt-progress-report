import type { ItemKind, ItemState } from "../../lib/domain";
import { Counts, CrossBureau, KindIcon, StatePill } from "../domain";
import { Button, Icon } from "../ui";
import { useThread } from "./context";

export type ItemSummary = {
  id: number;
  kind: ItemKind;
  state: ItemState;
  body: string;
  crossBureau: boolean;
  unitName?: string;
  resolutionNote?: string | null;
  comments?: number;
  reactions?: number;
};

type ItemRowProps = { item: ItemSummary; showState?: boolean };

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
    <li className="item-li">
      <Button type="button" className="item-row" onClick={handleOpenThread}>
        <KindIcon kind={item.kind} />
        <div>
          {hasUnitName && <div className="item-unit">{item.unitName}</div>}
          <div className="item-body">{item.body}</div>
          {hasResolutionNote && (
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
          <Counts comments={commentCount} reactions={reactionCount} />
        </div>
      </Button>
    </li>
  );
}
