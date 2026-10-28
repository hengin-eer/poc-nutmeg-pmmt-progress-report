import { action } from "@void/react";
import type { Props } from "../../pages/report.server";
import { RecordPill } from "../domain";
import { Card, Icon, SectionHeader } from "../ui";

export function PendingRecords({ pending, isOpen }: Pick<Props, "pending"> & { isOpen: boolean }) {
  if (pending.length === 0) return null;
  return (
    <Card as="section" className="card section">
      <SectionHeader className="section-head">
        <Icon name="arrow-go-forward-line" className="muted" />
        <h2>前回からの持ち越し</h2>
        <span className="hint">終わったらチェック</span>
      </SectionHeader>
      <ul className="list">
        {pending.map((r) => (
          <li key={r.id}>
            <label className="row" style={{ margin: 0, fontWeight: 500, gap: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                disabled={!isOpen}
                onChange={(e) => action("/report?toggleRecord", { data: { id: r.id, done: e.target.checked } })}
              />
              <RecordPill kind={r.kind} />
              <span>{r.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}
