import { Form, action, useForm } from "@void/react";
import { useEffect, useState } from "react";
import { formatJst, toJstInput } from "../../lib/domain";
import { type Props } from "../../pages/admin/index.server";
import { Button, Card, Checkbox, Icon, Input, Label, Pill, SectionHeader, Table } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type CycleSectionProps = Pick<Props, "cycles" | "defaults"> & { unitCount: number };

type Cycle = Props["cycles"][number];

export function CycleSection({ cycles, defaults, unitCount }: CycleSectionProps) {
  const form = useForm("/admin?createCycle", { meetingAt: toJstInput(defaults.meetingAt), deadlineAt: "", past: false }, { resetOnSuccess: true });
  const [editing, setEditing] = useState<number | null>(null);

  function handleCloseCycle(cy: Cycle) {
    return confirm("この回を閉じますか？") && action("/admin?closeCycle", { data: { id: cy.id } });
  }

  return (
    <Card as="section" size="large">
      <SectionHeader>
        <Icon name="calendar-event-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>PMMT の回</h2>
      </SectionHeader>
      <Form form={form} className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="meetingAt">会議日時</Label>
            <Input id="meetingAt" type="datetime-local" required value={form.data.meetingAt} onChange={(e) => form.setData("meetingAt", e.target.value)} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="deadlineAt">事前記入の締切</Label>
            <Input id="deadlineAt" type="datetime-local" required value={form.data.deadlineAt} onChange={(e) => form.setData("deadlineAt", e.target.value)} />
          </div>
          <Button type="submit" variant="primary" disabled={form.pending}>回を作る</Button>
        </div>
        <Label className="mt-3 flex items-center gap-2">
          <Checkbox checked={form.data.past ?? false} onChange={(e) => form.setData("past", e.target.checked)} />
          過去の回として作る
        </Label>
        <ScheduleError message={form.errors.meetingAt ?? form.errors.deadlineAt ?? form.errors.past ?? form.error?.message} />
      </Form>

      <div className="overflow-x-auto">
        <Table className="min-w-[480px]">
          <thead>
            <tr>
              <th>会議日時</th>
              <th>締切</th>
              <th>記入</th>
              <th>状態</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cycles.map((cy) => (
              <tr key={cy.id}>
                {editing === cy.id ? (
                  <td colSpan={2}><EditSchedule cycle={cy} onDone={() => setEditing(null)} /></td>
                ) : (
                  <>
                    <td>{formatJst(cy.meetingAt)}</td>
                    <td>{formatJst(cy.deadlineAt)}</td>
                  </>
                )}
                <td>
                  {cy.submitted} / {unitCount}
                </td>
                <td>{cy.status === "open" ? <Pill tone="green">受付中</Pill> : <Pill>終了</Pill>}</td>
                <td>
                  {cy.status === "open" && (
                    <div className="flex gap-2">
                      {editing !== cy.id && <Button size="small" onClick={() => setEditing(cy.id)}>日程を変更</Button>}
                      <Button size="small" onClick={() => handleCloseCycle(cy)}>回を閉じる</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}

function ScheduleError({ message }: { message?: string }) {
  return message ? <p role="alert" className={textStyles({ role: "error" })}>{message}</p> : null;
}

function EditSchedule({ cycle, onDone }: { cycle: Cycle; onDone: () => void }) {
  const form = useForm("/admin?updateDeadline", {
    id: cycle.id,
    meetingAt: toJstInput(cycle.meetingAt),
    deadlineAt: toJstInput(cycle.deadlineAt),
  });

  useEffect(() => {
    if (form.wasSuccessful) onDone();
  }, [form.wasSuccessful, onDone]);

  return (
    <Form form={form} className="flex flex-wrap items-end gap-2">
      <Label>
        会議日時
        <Input type="datetime-local" required value={form.data.meetingAt} onChange={(e) => form.setData("meetingAt", e.target.value)} />
      </Label>
      <Label>
        締切
        <Input type="datetime-local" required value={form.data.deadlineAt} onChange={(e) => form.setData("deadlineAt", e.target.value)} />
      </Label>
      <Button type="submit" variant="primary" size="small" disabled={form.pending}>保存</Button>
      <Button type="button" size="small" onClick={onDone}>やめる</Button>
      <ScheduleError message={form.errors.meetingAt ?? form.errors.deadlineAt ?? form.errors.id ?? form.error?.message} />
    </Form>
  );
}
