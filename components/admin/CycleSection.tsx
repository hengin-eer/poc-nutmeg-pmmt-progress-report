import { Form, action, useForm } from "@void/react";
import { useState, type ChangeEvent } from "react";
import { formatJst, toJstInput } from "../../lib/domain";
import { type Props } from "../../pages/admin/index.server";
import { Button, Card, Icon, Input, Label, Pill, Row, SectionHeader, Table } from "../ui";
import { flowStyles } from "../ui/Flow";
import { headingStyles, textStyles } from "../ui/styles";

type CycleSectionProps = Pick<Props, "cycles" | "defaults"> & { unitCount: number };

type Cycle = Props["cycles"][number];

export function CycleSection({ cycles, defaults, unitCount }: CycleSectionProps) {
  const form = useForm("/admin?createCycle", { meetingAt: toJstInput(defaults.meetingAt), deadlineAt: toJstInput(defaults.deadlineAt) });
  const [editing, setEditing] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");
  const hasDeadlineAtError = Boolean(form.errors.deadlineAt);

  function isEditingCycle(cy: Cycle) {
    return editing === cy.id;
  }

  function isCycleOpen(cy: Cycle) {
    return cy.status === "open";
  }

  function handleMeetingAtChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("meetingAt", e.target.value);
  }

  function handleDeadlineAtChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("deadlineAt", e.target.value);
  }

  function handleEditedDeadlineChange(e: ChangeEvent<HTMLInputElement>) {
    setDeadline(e.target.value);
  }

  async function handleUpdateDeadline(cy: Cycle) {
    await action("/admin?updateDeadline", { data: { id: cy.id, deadlineAt: deadline } });
    setEditing(null);
  }

  function handleEditDeadline(cy: Cycle) {
    setEditing(cy.id);
    setDeadline(toJstInput(cy.deadlineAt));
  }

  function handleCloseCycle(cy: Cycle) {
    return confirm("この回を閉じますか？") && action("/admin?closeCycle", { data: { id: cy.id } });
  }

  return (
    <Card as="section" size="large">
      <SectionHeader>
        <Icon name="calendar-event-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>PMMT の回</h2>
      </SectionHeader>
      <Form form={form} className="flex flex-wrap items-end mb-3 gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="meetingAt">PMMT の日時</Label>
          <Input id="meetingAt" type="datetime-local" value={form.data.meetingAt} onChange={handleMeetingAtChange} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="deadlineAt">
            事前記入の締切 <span className={textStyles({ role: "hint" })}>二枚看板の打ち合わせの前</span>
          </Label>
          <Input id="deadlineAt" type="datetime-local" value={form.data.deadlineAt} onChange={handleDeadlineAtChange} />
        </div>
        <Button type="submit" variant="primary" disabled={form.pending}>
          回を作る
        </Button>
      </Form>
      {hasDeadlineAtError && <p className={textStyles({ className: "mb-3", role: "error" })}>{form.errors.deadlineAt}</p>}
      <p className="text-caption font-normal text-muted mb-6">新しい回を作ると、開いている回は自動で閉じます（「当日に話す」の残りは先送りとして記録）。過去の日付で作ると、取り込み用の「閉じた回」になります。</p>

      <div className="overflow-x-auto">
        <Table className="min-w-[480px]">
          <thead>
            <tr>
              <th>PMMT</th>
              <th>締切</th>
              <th>記入</th>
              <th>状態</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cycles.map((cy) => (
              <tr key={cy.id}>
                <td>{formatJst(cy.meetingAt)}</td>
                <td>
                  {isEditingCycle(cy) ? (
                    <Row>
                      <Input type="datetime-local" value={deadline} onChange={handleEditedDeadlineChange} className="w-auto" />
                      <Button
                         variant="primary" size="small"
                        onClick={() => handleUpdateDeadline(cy)}
                      >
                        保存
                      </Button>
                    </Row>
                  ) : (
                    <span className={flowStyles({ direction: "row", gap: 2 })}>
                      {formatJst(cy.deadlineAt)}
                      {isCycleOpen(cy) && (
                        <Button
                           variant="ghost" size="small"
                          onClick={() => handleEditDeadline(cy)}
                        >
                          変更
                        </Button>
                      )}
                    </span>
                  )}
                </td>
                <td>
                  {cy.submitted} / {unitCount}
                </td>
                <td>{isCycleOpen(cy) ? <Pill tone="green">受付中</Pill> : <Pill>終了</Pill>}</td>
                <td>
                  {isCycleOpen(cy) && (
                    <Button size="small" onClick={() => handleCloseCycle(cy)}>
                      閉じる
                    </Button>
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
