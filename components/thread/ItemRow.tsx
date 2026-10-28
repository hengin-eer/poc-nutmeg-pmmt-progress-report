import { Counts, CrossBureau, KindIcon, StatePill } from "../domain";
import { Button, Icon, Row } from "../ui";
import { useThread } from "./context";
import type { ItemState } from "../../lib/domain";

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
    <li data-slot="item">
      <Button type="button" variant="plain" data-slot="item-row" className="grid w-full box-content grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 -mx-3 rounded-xl p-3 text-left text-inherit hover:bg-surface-2" onClick={() => open(item.id)}>
        <KindIcon kind={item.kind} />
        <div>
          {item.unitName && <div className="text-meta font-bold">{item.unitName}</div>}
          <div className="mt-1 line-clamp-3 whitespace-pre-wrap leading-relaxed text-text">{item.body}</div>
          {item.resolutionNote && (
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
          <Counts comments={item.comments ?? 0} reactions={item.reactions ?? 0} />
        </div>
      </Button>
    </li>
  );
}
