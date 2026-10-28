import type { ChangeEvent } from "react";
import { action, Form, useForm } from "@void/react";
import { useState } from "react";
import { Button, Card, Icon, Pill, SectionHeader } from "../ui";
import { formatJst, toJstInput } from "../../lib/domain";
import { type Props } from "../../pages/admin/index.server";

type CycleSectionProps = Pick<Props, "cycles" | "defaults"> & { unitCount: number };

export function CycleSection({ cycles, defaults, unitCount }: CycleSectionProps) {
  const form = useForm("/admin?createCycle", { meetingAt: toJstInput(defaults.meetingAt), deadlineAt: toJstInput(defaults.deadlineAt) });
  const [editing, setEditing] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");

  function handleMeetingAtChange(e: ChangeEvent<HTMLInputElement>) { return form.setData("meetingAt", e.target.value); }

  function handleDeadlineAtChange(e: ChangeEvent<HTMLInputElement>) { return form.setData("deadlineAt", e.target.value); }

  function handleEditedDeadlineChange(e: ChangeEvent<HTMLInputElement>) { return setDeadline(e.target.value); }

  async function handleUpdateDeadline(cy: (typeof cycles)[number]) {
    await action("/admin?updateDeadline", { data: { id: cy.id, deadlineAt: deadline } });
    setEditing(null);
  }

  function handleEditDeadline(cy: (typeof cycles)[number]) {
    setEditing(cy.id);
    setDeadline(toJstInput(cy.deadlineAt));
  }

  function handleCloseCycle(cy: (typeof cycles)[number]) {
    return confirm("この回を閉じますか？") && action("/admin?closeCycle", { data: { id: cy.id } });
  }

  const hasDeadlineAtError = form.errors.deadlineAt;
  function isEditingCycle(cy: (typeof cycles)[number]) { return editing === cy.id; }
  function isCycleOpen(cy: (typeof cycles)[number]) { return cy.status === "open"; }

  return (
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head">
        <Icon name="calendar-event-line" className="muted" />
        <h2>PMMT の回</h2>
      </SectionHeader>
      <Form form={form} className="row" style={{ alignItems: "flex-end", marginBottom: 12, gap: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="meetingAt">PMMT の日時</label>
          <input id="meetingAt" type="datetime-local" value={form.data.meetingAt} onChange={handleMeetingAtChange} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="deadlineAt">
            事前記入の締切 <span className="hint">二枚看板の打ち合わせの前</span>
          </label>
          <input id="deadlineAt" type="datetime-local" value={form.data.deadlineAt} onChange={handleDeadlineAtChange} />
        </div>
        <Button type="submit" className="primary" disabled={form.pending}>
          回を作る
        </Button>
      </Form>
      {hasDeadlineAtError && <p className="error">{form.errors.deadlineAt}</p>}
      <p className="hint" style={{ marginBottom: 24 }}>新しい回を作ると、開いている回は自動で閉じます（「当日に話す」の残りは先送りとして記録）。過去の日付で作ると、取り込み用の「閉じた回」になります。</p>

      <div className="table-wrap">
        <table>
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
                    <div className="row">
                      <input type="datetime-local" value={deadline} onChange={handleEditedDeadlineChange} style={{ width: "auto" }} />
                      <Button
                        className="small primary"
                        onClick={() => handleUpdateDeadline(cy)}
                      >
                        保存
                      </Button>
                    </div>
                  ) : (
                    <span className="row">
                      {formatJst(cy.deadlineAt)}
                      {isCycleOpen(cy) && (
                        <Button
                          className="ghost small"
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
                <td>{isCycleOpen(cy) ? <Pill className="pill green">受付中</Pill> : <Pill className="pill">終了</Pill>}</td>
                <td>
                  {isCycleOpen(cy) && (
                    <Button className="small" onClick={() => handleCloseCycle(cy)}>
                      閉じる
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
