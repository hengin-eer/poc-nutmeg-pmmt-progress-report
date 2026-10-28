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

  return (
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head">
        <Icon name="calendar-event-line" className="muted" />
        <h2>PMMT の回</h2>
      </SectionHeader>
      <Form form={form} className="row" style={{ alignItems: "flex-end", marginBottom: 12, gap: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="meetingAt">PMMT の日時</label>
          <input id="meetingAt" type="datetime-local" value={form.data.meetingAt} onChange={(e) => form.setData("meetingAt", e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="deadlineAt">
            事前記入の締切 <span className="hint">二枚看板の打ち合わせの前</span>
          </label>
          <input id="deadlineAt" type="datetime-local" value={form.data.deadlineAt} onChange={(e) => form.setData("deadlineAt", e.target.value)} />
        </div>
        <Button type="submit" className="primary" disabled={form.pending}>
          回を作る
        </Button>
      </Form>
      {form.errors.deadlineAt && <p className="error">{form.errors.deadlineAt}</p>}
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
                  {editing === cy.id ? (
                    <div className="row">
                      <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: "auto" }} />
                      <Button
                        className="small primary"
                        onClick={async () => {
                          await action("/admin?updateDeadline", { data: { id: cy.id, deadlineAt: deadline } });
                          setEditing(null);
                        }}
                      >
                        保存
                      </Button>
                    </div>
                  ) : (
                    <span className="row">
                      {formatJst(cy.deadlineAt)}
                      {cy.status === "open" && (
                        <Button
                          className="ghost small"
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
                <td>{cy.status === "open" ? <Pill className="pill green">受付中</Pill> : <Pill className="pill">終了</Pill>}</td>
                <td>
                  {cy.status === "open" && (
                    <Button className="small" onClick={() => confirm("この回を閉じますか？") && action("/admin?closeCycle", { data: { id: cy.id } })}>
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
