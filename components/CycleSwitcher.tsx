import { cycleLabel } from "../lib/domain";
import { Link, Row } from "./ui";

type CycleOption = { id: number; meetingAt: string; status: "open" | "closed" };

export function CycleSwitcher({ path, selectedId, cycles, tab }: {
  path: "/" | "/report" | "/items";
  selectedId: number;
  cycles: CycleOption[];
  tab?: string;
}) {
  if (cycles.length < 2) return null;

  return (
    <nav aria-label="回の切り替え" className="my-4">
      <Row>
        {cycles.map((cycle) => cycle.id === selectedId ? (
          <span key={cycle.id} aria-current="true" className="font-bold text-meta">{cycleLabel(cycle.meetingAt)}</span>
        ) : (
          <Link key={cycle.id} href={`${path}?cycle=${cycle.id}${tab ? `&tab=${tab}` : ""}`} className="text-meta">
            {cycleLabel(cycle.meetingAt)}
          </Link>
        ))}
      </Row>
    </nav>
  );
}
