import { action } from "@void/react";
import { type Props } from "../../pages/report.server";
import { RecordPill } from "../domain";
import { Card, Checkbox, Icon, Label, List, SectionHeader } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type PendingRecordsProps = Pick<Props, "pending"> & { isOpen: boolean };

export function PendingRecords({ pending, isOpen }: PendingRecordsProps) {
  if (pending.length === 0) return null;
  const isCycleClosed = !isOpen;

  function handleToggleRecord(id: number, checked: boolean) {
    action("/report?toggleRecord", { data: { id, done: checked } });
  }

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

                disabled={isCycleClosed}
                onChange={(e) => handleToggleRecord(r.id, e.target.checked)}
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
