import { Form, action, useForm } from "@void/react";
import { useEffect, useState, type ChangeEvent } from "react";
import { getValidationErrors } from "void/pages-client";
import { type ItemKind } from "../../lib/domain";
import { type Props } from "../../pages/report.server";
import { CrossBureau, KindIcon, StatePill, ITEM_KIND_CONFIG } from "../domain";
import { ThreadButton, useThread } from "../thread";
import { Badge, Button, Card, Checkbox, Icon, IconButton, Label, List, Pill, Row, SectionHeader, Textarea } from "../ui";
import { flowStyles } from "../ui/Flow";
import { headingStyles, textStyles } from "../ui/styles";

type ItemSectionProps = {
  kind: ItemKind;
  list: Props["myItems"];
  isOpen: boolean;
  cycleId: number;
};

type MyItem = Props["myItems"][number];

export function ItemSection({
  kind,
  list,
  isOpen,
  cycleId,
}: ItemSectionProps) {
  const form = useForm("/report?addItem", { cycleId, kind, body: "", crossBureau: false }, { resetOnSuccess: true });
  const [deleteError, setDeleteError] = useState<string>();
  const [adding, setAdding] = useState(false);
  const { open } = useThread();

  useEffect(() => {
    if (form.wasSuccessful) setAdding(false);
  }, [form.wasSuccessful]);

  const kindConfig = ITEM_KIND_CONFIG[kind];
  const canMarkCrossBureau = kindConfig.allowsCrossBureau;
  const hasItems = list.length > 0;
  const addError = form.errors.body ?? form.errors.cycleId ?? form.error?.message;

  function canDeleteItem(i: MyItem) {
    return i.state === "open" && isOpen;
  }

  function handleOpenThread(i: MyItem) {
    open(i.id);
  }

  async function handleDeleteItem(id: number) {
    const confirmed = confirm("削除しますか？");
    if (!confirmed) return;
    setDeleteError(undefined);
    const result = await action("/report?deleteItem", { data: { id, cycleId } });
    if (!result.ok) setDeleteError(getValidationErrors(result.error.body)?.cycleId ?? result.error.message);
  }

  function handleBodyChange(e: ChangeEvent<HTMLTextAreaElement>) {
    form.setData("body", e.target.value);
  }

  function handleCrossBureauChange(e: ChangeEvent<HTMLInputElement>) {
    form.setData("crossBureau", e.target.checked);
  }

  function handleCancelAdding() {
    setAdding(false);
  }

  function handleStartAdding() {
    setAdding(true);
  }

  return (
    <Card as="section">
      <SectionHeader>
        <KindIcon kind={kind} />
        <h2 className={headingStyles({ level: "heading" })}>{kindConfig.label}</h2>
        <Badge>{list.length}</Badge>
      </SectionHeader>
      <p className="mb-3 text-caption font-normal text-muted -mt-2">
        {kindConfig.hint}
      </p>

      {hasItems && (
        <List className="mt-2 mb-4">
          {list.map((i) => (
            <li key={i.id} className={flowStyles({ direction: "column", gap: 2 })}>
              <Button variant="plain" type="button" className="-mx-2 cursor-pointer rounded-lg px-2 py-1 text-left whitespace-pre-wrap leading-relaxed font-medium hover:bg-surface-2 focus-visible:outline-3 focus-visible:outline-accent-soft" onClick={() => handleOpenThread(i)} title="スレッドを開く">
                {i.body}
              </Button>
              <Row>
                <StatePill state={i.state} />
                <CrossBureau on={i.crossBureau} />
                {i.late && <Pill tone="yellow">締切後</Pill>}
                <span className="flex-1" />
                <ThreadButton id={i.id} comments={i.comments} />
                {canDeleteItem(i) && (
                  <IconButton
                    type="button"
                     danger
                    title="削除"
                    aria-label="削除"
                    onClick={() => handleDeleteItem(i.id)}
                  >
                    <Icon name="delete-bin-line" />
                  </IconButton>
                )}
              </Row>
            </li>
          ))}
        </List>
      )}

      {deleteError && <p role="alert" className={textStyles({ role: "error" })}>{deleteError}</p>}
      {isOpen &&
        (adding ? (
          <Form form={form} className={flowStyles({ direction: "column", gap: 2 })}>
            <div>
              <Textarea
                autoFocus
                value={form.data.body}
                onChange={handleBodyChange}
                placeholder={kindConfig.placeholder}
              />
              {addError && <div role="alert" className={textStyles({ role: "error" })}>{addError}</div>}
            </div>
            <Row>
              {canMarkCrossBureau && (
                <Label className="flex flex-wrap items-center gap-2 font-medium m-0 cursor-pointer">
                  <Checkbox checked={form.data.crossBureau} onChange={handleCrossBureauChange} />
                  他局・実行委員全体に関わる
                </Label>
              )}
              <span className="flex-1" />
              <Button type="button" variant="ghost" size="small" onClick={handleCancelAdding}>
                やめる
              </Button>
              <Button type="submit" variant="primary" size="small" disabled={form.pending}>
                追加
              </Button>
            </Row>
          </Form>
        ) : (
          <Button type="button" variant="ghost" className="w-full border border-dashed border-border text-muted hover:border-accent hover:bg-accent-soft hover:text-accent" onClick={handleStartAdding}>
            <Icon name="add-line" />
            追加
          </Button>
        ))}
    </Card>
  );
}

