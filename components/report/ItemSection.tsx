import { action, Form, useForm } from "@void/react";
import { useEffect, useState } from "react";
import type { Props } from "../../pages/report.server";
import { CrossBureau, KindIcon, StatePill } from "../domain";
import { ThreadButton, useThread } from "../thread";
import { Badge, Button, Card, Checkbox, Icon, IconButton, Label, List, Row, SectionHeader, Textarea } from "../ui";

export function ItemSection({
  title,
  kind,
  hint,
  list,
  isOpen,
}: {
  title: string;
  kind: "confirm" | "talk";
  hint: string;
  list: Props["myItems"];
  isOpen: boolean;
}) {
  const form = useForm("/report?addItem", { kind, body: "", crossBureau: false }, { resetOnSuccess: true });
  const [adding, setAdding] = useState(false);
  const { open } = useThread();
  useEffect(() => {
    if (form.wasSuccessful) setAdding(false);
  }, [form.wasSuccessful]);

  return (
    <Card as="section">
      <SectionHeader>
        <KindIcon kind={kind} />
        <h2 className="text-heading font-bold text-text">{title}</h2>
        <Badge>{list.length}</Badge>
      </SectionHeader>
      <p className="text-caption font-normal text-muted -mt-2">
        {hint}
      </p>

      {list.length > 0 && (
        <List className="mt-2 mb-4">
          {list.map((i) => (
            <li key={i.id} className="flex flex-col gap-2">
              <Button variant="plain" type="button" className="-mx-2 cursor-pointer rounded-lg px-2 py-1 text-left whitespace-pre-wrap leading-relaxed font-medium hover:bg-surface-2 focus-visible:outline-3 focus-visible:outline-accent-soft" onClick={() => open(i.id)} title="スレッドを開く">
                {i.body}
              </Button>
              <Row>
                <StatePill state={i.state} />
                <CrossBureau on={i.crossBureau} />
                <span className="flex-1" />
                <ThreadButton id={i.id} comments={i.comments} />
                {i.state === "open" && isOpen && (
                  <IconButton
                    type="button"
                     danger
                    title="削除"
                    aria-label="削除"
                    onClick={() => confirm("削除しますか？") && action("/report?deleteItem", { data: { id: i.id } })}
                  >
                    <Icon name="delete-bin-line" />
                  </IconButton>
                )}
              </Row>
            </li>
          ))}
        </List>
      )}

      {isOpen &&
        (adding ? (
          <Form form={form} className="flex flex-col gap-4 gap-2">
            <div>
              <Textarea
                autoFocus
                value={form.data.body}
                onChange={(e) => form.setData("body", e.target.value)}
                placeholder={kind === "confirm" ? "例: ○○を△△にしてもいい？" : "例: こんな勉強会をやってみたい"}
              />
              {form.errors.body && <div className="mt-2 text-caption text-red">{form.errors.body}</div>}
            </div>
            <Row>
              {kind === "confirm" && (
                <Label className="flex flex-wrap items-center gap-2 font-medium m-0 cursor-pointer">
                  <Checkbox checked={form.data.crossBureau} onChange={(e) => form.setData("crossBureau", e.target.checked)} />
                  他局・実行委員全体に関わる
                </Label>
              )}
              <span className="flex-1" />
              <Button type="button"  variant="ghost" size="small" onClick={() => setAdding(false)}>
                やめる
              </Button>
              <Button type="submit"  variant="primary" size="small" disabled={form.pending}>
                追加
              </Button>
            </Row>
          </Form>
        ) : (
          <Button type="button"  variant="ghost" className="w-full border border-dashed border-border text-muted hover:border-accent hover:bg-accent-soft hover:text-accent" onClick={() => setAdding(true)}>
            <Icon name="add-line" />
            追加
          </Button>
        ))}
    </Card>
  );
}

