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
  return (
    <li className="item-li">
      <Button type="button" className="item-row" onClick={() => open(item.id)}>
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
      </Button>
    </li>
  );
}
