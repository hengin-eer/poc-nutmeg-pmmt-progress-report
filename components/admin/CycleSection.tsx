import { flowStyles } from "../ui/Flow";
import { headingStyles, textStyles } from "../ui/styles";
import { action, Form, useForm } from "@void/react";
import { useState } from "react";
import { Button, Card, Icon, Input, Label, Pill, Row, SectionHeader, Table } from "../ui";
import { formatJst, toJstInput } from "../../lib/domain";
import { type Props } from "../../pages/admin/index.server";

export function CycleSection({ cycles, defaults, unitCount }: Pick<Props, "cycles" | "defaults"> & { unitCount: number }) {
  const form = useForm("/admin?createCycle", { meetingAt: toJstInput(defaults.meetingAt), deadlineAt: toJstInput(defaults.deadlineAt) });
  const [editing, setEditing] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");

  return (
    <Card as="section" size="large">
      <SectionHeader>
        <Icon name="calendar-event-line" className="text-muted" />
        <h2 className={headingStyles({ level: "heading" })}>PMMT の回</h2>
      </SectionHeader>
      <Form form={form} className="flex flex-wrap items-end mb-3 gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="meetingAt">PMMT の日時</Label>
          <Input id="meetingAt" type="datetime-local" value={form.data.meetingAt} onChange={(e) => form.setData("meetingAt", e.target.value)} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="deadlineAt">
            事前記入の締切 <span className={textStyles({ role: "hint" })}>二枚看板の打ち合わせの前</span>
          </Label>
          <Input id="deadlineAt" type="datetime-local" value={form.data.deadlineAt} onChange={(e) => form.setData("deadlineAt", e.target.value)} />
        </div>
        <Button type="submit"  variant="primary" disabled={form.pending}>
          回を作る
        </Button>
      </Form>
      {form.errors.deadlineAt && <p className={textStyles({ role: "error" })}>{form.errors.deadlineAt}</p>}
      <p className="text-caption font-normal text-muted mb-6">新しい回を作ると、開いている回は自動で閉じます（「当日に話す」の残りは先送りとして記録）。過去の日付で作ると、取り込み用の「閉じた回」になります。</p>

      <div className="overflow-x-auto">
        <Table>
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
                  {editing === cy.id ? (
                    <Row>
                      <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-auto" />
                      <Button
                         variant="primary" size="small"
                        onClick={async () => {
                          await action("/admin?updateDeadline", { data: { id: cy.id, deadlineAt: deadline } });
                          setEditing(null);
                        }}
                      >
                        保存
                      </Button>
                    </Row>
                  ) : (
                    <span className={flowStyles({ direction: "row", gap: 2 })}>
                      {formatJst(cy.deadlineAt)}
                      {cy.status === "open" && (
                        <Button
                           variant="ghost" size="small"
                          onClick={() => {
                            setEditing(cy.id);
                            setDeadline(toJstInput(cy.deadlineAt));
                          }}
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
                <td>{cy.status === "open" ? <Pill tone="green">受付中</Pill> : <Pill>終了</Pill>}</td>
                <td>
                  {cy.status === "open" && (
                    <Button  size="small" onClick={() => confirm("この回を閉じますか？") && action("/admin?closeCycle", { data: { id: cy.id } })}>
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
