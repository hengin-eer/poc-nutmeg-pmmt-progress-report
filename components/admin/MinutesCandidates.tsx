import { Form } from "@void/react";
import { Button, Card, Checkbox, EmptyState, Field, Input, Label, List, Row, SectionHeader, Select, Textarea } from "../ui";
import { RecordPill } from "../domain";
import { formatJst } from "../../lib/domain";
import { type Props } from "../../pages/admin/import.server";
import { type ImportState } from "./useMinutesImport";

export function MinutesCandidates({ cycles, units, state }: Props & { state: ImportState }) {
  const { rows, form, summary, setSummary, update, selected } = state;
  return (
    <Card as="section" size="large">
      <SectionHeader><span className="grid size-6 shrink-0 place-items-center rounded-full bg-text text-caption font-extrabold text-bg">2</span><h2 className="text-heading font-bold text-text">確認して登録する</h2></SectionHeader>
      {rows.length === 0 ? (
        <EmptyState>左に貼り付けて「候補に分ける」を押してください</EmptyState>
      ) : (
        <Form
          form={form}
          onSubmitCapture={() => {
            form.setData("summary", summary);
            form.setData(
              "entries",
              selected.map(({ kind, title, body, unitId }) => ({ kind, title, body, unitId })),
            );
          }}
        >
          <Field>
            <Label>どの回の議事録か</Label>
            <Select value={form.data.cycleId} onChange={(e) => form.setData("cycleId", Number(e.target.value))}>
              <option value={0}>選んでください</option>
              {cycles.map((cy) => (
                <option key={cy.id} value={cy.id}>
                  {formatJst(cy.meetingAt)}
                  {cy.status === "open" ? "（受付中）" : ""}
                </option>
              ))}
            </Select>
            {form.errors.cycleId && <div className="mt-2 text-caption text-red">{form.errors.cycleId}</div>}
          </Field>

          <List className="mb-3">
            {rows.map((r, i) => (
              <li key={i} className="flex flex-col gap-4 gap-1">
                <Row>
                  <Checkbox checked={r.checked} onChange={(e) => update(i, { checked: e.target.checked })} aria-label="登録する" />
                  <RecordPill kind={r.kind} />
                  <Select value={r.unitId ?? ""} onChange={(e) => update(i, { unitId: e.target.value ? Number(e.target.value) : null })} data-tw="w-auto px-2 py-1 text-caption">
                    <option value="">ユニットなし</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </Select>
                  {r.unitName && r.unitId === null && <span className="mt-2 text-caption text-red">「{r.unitName}」が見つかりません</span>}
                </Row>
                <Input type="text" value={r.title} onChange={(e) => update(i, { title: e.target.value })} />
                {r.body && <div className="text-caption text-muted whitespace-pre-wrap">{r.body}</div>}
              </li>
            ))}
          </List>

          {summary && (
            <Field>
              <Label>要約 <span className="text-caption font-normal text-muted">回の要約として保存されます</span></Label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
            </Field>
          )}
          {form.errors.entries && <div className="mt-2 text-caption text-red">{form.errors.entries}</div>}
          <Button type="submit"  variant="primary" disabled={form.pending || selected.length === 0}>
            {selected.length} 件を登録する
          </Button>
        </Form>
      )}
    </Card>
  );
}
