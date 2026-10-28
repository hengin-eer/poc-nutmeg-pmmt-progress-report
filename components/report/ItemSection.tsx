import type { ChangeEvent } from "react";
import type { ItemKind } from "../../lib/domain";
import { action, Form, useForm } from "@void/react";
import { useEffect, useState } from "react";
import type { Props } from "../../pages/report.server";
import { CrossBureau, ITEM_KIND_CONFIG, StatePill } from "../domain";
import { ThreadButton, useThread } from "../thread";
import { Badge, Button, Card, Icon, IconButton, SectionHeader } from "../ui";

type ItemSectionProps = {
  kind: ItemKind;
  list: Props["myItems"];
  isOpen: boolean;
};

export function ItemSection({
  kind,
  list,
  isOpen,
}: ItemSectionProps) {
  const kindConfig = ITEM_KIND_CONFIG[kind];
  const canMarkCrossBureau = kindConfig.allowsCrossBureau;
  const form = useForm("/report?addItem", { kind, body: "", crossBureau: false }, { resetOnSuccess: true });
  const [adding, setAdding] = useState(false);
  const { open } = useThread();
  useEffect(() => {
    if (form.wasSuccessful) setAdding(false);
  }, [form.wasSuccessful]);

    function handleOpenThread(i: (typeof list)[number]) { return open(i.id); }

  function handleDeleteItem(i: (typeof list)[number]) { return confirm("削除しますか？") && action("/report?deleteItem", { data: { id: i.id } }); }

  function handleBodyChange(e: ChangeEvent<HTMLTextAreaElement>) { return form.setData("body", e.target.value); }

  function handleCrossBureauChange(e: ChangeEvent<HTMLInputElement>) { return form.setData("crossBureau", e.target.checked); }

  function handleCancelAdding() { return setAdding(false); }

  function handleStartAdding() { return setAdding(true); }

  return (
    <Card as="section" className="card">
      <SectionHeader className="section-head">
        <span className={`kind-icon ${kind}`}>
          <Icon name={kindConfig.icon} />
        </span>
        <h2>{kindConfig.label}</h2>
        <Badge className="count">{list.length}</Badge>
      </SectionHeader>
      <p className="hint" style={{ marginTop: -8 }}>
        {kindConfig.hint}
      </p>

      {list.length > 0 && (
        <ul className="list" style={{ margin: "8px 0 16px" }}>
          {list.map((i) => (
            <li key={i.id} className="my-item">
              <Button type="button" className="my-item-body" onClick={() => handleOpenThread(i)} title="スレッドを開く">
                {i.body}
              </Button>
              <div className="row">
                <StatePill state={i.state} />
                <CrossBureau on={i.crossBureau} />
                <span className="spacer" />
                <ThreadButton id={i.id} comments={i.comments} />
                {i.state === "open" && isOpen && (
                  <IconButton
                    type="button"
                    className="icon-button danger"
                    title="削除"
                    aria-label="削除"
                    onClick={() => handleDeleteItem(i)}
                  >
                    <Icon name="delete-bin-line" />
                  </IconButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen &&
        (adding ? (
          <Form form={form} className="stack" style={{ gap: 10 }}>
            <div>
              <textarea
                autoFocus
                value={form.data.body}
                onChange={handleBodyChange}
                placeholder={kindConfig.placeholder}
              />
              {form.errors.body && <div className="error">{form.errors.body}</div>}
            </div>
            <div className="row">
              {canMarkCrossBureau && (
                <label className="row" style={{ fontWeight: 500, margin: 0, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.data.crossBureau} onChange={handleCrossBureauChange} />
                  他局・実行委員全体に関わる
                </label>
              )}
              <span className="spacer" />
              <Button type="button" className="ghost small" onClick={handleCancelAdding}>
                やめる
              </Button>
              <Button type="submit" className="primary small" disabled={form.pending}>
                追加
              </Button>
            </div>
          </Form>
        ) : (
          <Button type="button" className="ghost add-button" onClick={handleStartAdding}>
            <Icon name="add-line" />
            追加
          </Button>
        ))}
    </Card>
  );
}

