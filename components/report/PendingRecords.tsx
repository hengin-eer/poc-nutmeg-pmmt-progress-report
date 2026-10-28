import { headingStyles, textStyles } from "../ui/styles";
import { action } from "@void/react";
import { RecordPill } from "../domain";
import { Card, Checkbox, Icon, Label, List, SectionHeader } from "../ui";
import type { Props } from "../../pages/report.server";

export function PendingRecords({ pending, isOpen }: Pick<Props, "pending"> & { isOpen: boolean }) {
  if (pending.length === 0) return null;
  return (
    <Card as="section" className="mt-10">
      <SectionHeader>
        <Icon name="arrow-go-forward-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>前回からの持ち越し</h2>
        <span className={textStyles({ role: "hint" })}>終わったらチェック</span>
      </SectionHeader>
      <List>
        {pending.map((r) => (
          <li key={r.id}>
            <Label className="flex flex-wrap items-center m-0 font-medium gap-3 cursor-pointer">
              <Checkbox

                disabled={!isOpen}
                onChange={(e) => action("/report?toggleRecord", { data: { id: r.id, done: e.target.checked } })}
              />
              <RecordPill kind={r.kind} />
              <span>{r.title}</span>
            </Label>
          </li>
        ))}
      </List>
    </Card>
  );
}
