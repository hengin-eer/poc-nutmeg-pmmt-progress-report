import { action, Form, Link, useForm, useShared } from "@void/react";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Icon, IconButton, PageHeader, Pill, SectionHeader } from "../../components/ui";
import { UNIT_KIND_LABEL, type UnitKind } from "../../components/domain";
import { formatJst, toJstInput } from "../../lib/domain";
import type { Props } from "./index.server";

const ROLE_LABEL = { lead: "部門長", chief: "局長", vice: "副局長", viewer: "閲覧のみ" } as const;

export default function AdminPage({ cycles, units, members, defaults }: Props) {
  return (
    <>
      <PageHeader className="page-head">
        <div>
          <h1>管理</h1>
          <div className="lead">局長・副局長だけが使えます</div>
        </div>
        <Link href="/admin/import" className="button primary">
          <Icon name="import-line" />
          議事録・過去の回を取り込む
        </Link>
      </PageHeader>

      <CycleSection cycles={cycles} defaults={defaults} unitCount={units.length} />
      <MemberSection members={members} units={units} />
      <UnitSection units={units} />
    </>
  );
}

function CycleSection({ cycles, defaults, unitCount }: Pick<Props, "cycles" | "defaults"> & { unitCount: number }) {
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

function MemberSection({ members, units }: Pick<Props, "members" | "units">) {
  const { me } = useShared();
  const [editing, setEditing] = useState<number | null>(null);
  const form = useForm("/admin?addMember", { name: "", email: "", role: "lead" as const, unitId: units[0]?.id ?? 0, slackUserId: "" }, { resetOnSuccess: true });
  const unitName = (id: number | null) => units.find((u) => u.id === id)?.name ?? "—";

  return (
    <Card as="section" className="card card-lg section">
      <SectionHeader className="section-head">
        <Icon name="group-line" className="muted" />
        <h2>メンバー</h2>
        <Badge className="count">{members.length}</Badge>
      </SectionHeader>
      <p className="hint">ここに登録された NUTMEG アカウントだけがログインできます。Slack のユーザー ID を入れると、リマインドでメンションされます。</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>名前</th>
              <th>アドレス</th>
              <th>役割</th>
              <th>ユニット</th>
              <th>Slack</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => editing === m.id ? (
              <MemberEditRow key={m.id} member={m} units={units} isSelf={m.id === me?.id} onDone={() => setEditing(null)} />
            ) : (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td className="meta">{m.email}</td>
                <td>{ROLE_LABEL[m.role]}</td>
                <td>{unitName(m.unitId)}</td>
                <td className="meta">{m.slackUserId ?? "—"}</td>
                <td>
                  <IconButton
                    type="button"
                    className="icon-button"
                    title="編集"
                    aria-label={`${m.name} さんを編集`}
                    onClick={() => setEditing(m.id)}
                  >
                    <Icon name="pencil-line" />
                  </IconButton>
                  <IconButton
                    className="icon-button danger"
                    title="削除"
                    aria-label={`${m.name} さんを削除`}
                    onClick={async () => {
                      if (!confirm(`${m.name} さんを削除しますか？`)) return;
                      const r = await action("/admin?deleteMember", { data: { id: m.id } });
                      if (!r.ok) alert(r.error.message);
                    }}
                  >
                    <Icon name="delete-bin-line" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Form form={form} className="grid add-member" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", alignItems: "end", marginTop: 24, gap: 12 }}>
        <div>
          <label>名前</label>
          <input type="text" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
          {form.errors.name && <div className="error">{form.errors.name}</div>}
        </div>
        <div>
          <label>アドレス</label>
          <input type="email" value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} placeholder="25.t.yamada.nutfes@gmail.com" />
          {form.errors.email && <div className="error">{form.errors.email}</div>}
        </div>
        <div>
          <label>役割</label>
          <select value={form.data.role} onChange={(e) => form.setData("role", e.target.value as typeof form.data.role)}>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>ユニット</label>
          <select value={form.data.unitId} onChange={(e) => form.setData("unitId", Number(e.target.value))}>
            <option value={0}>なし</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Slack ID <span className="hint">任意</span></label>
          <input type="text" value={form.data.slackUserId} onChange={(e) => form.setData("slackUserId", e.target.value)} placeholder="U0123ABCD" />
        </div>
        <Button type="submit" className="primary" disabled={form.pending}>
          <Icon name="user-add-line" />
          追加
        </Button>
      </Form>
    </Card>
  );
}

function MemberEditRow({ member, units, isSelf, onDone }: {
  member: Props["members"][number];
  units: Props["units"];
  isSelf: boolean;
  onDone: () => void;
}) {
  const form = useForm("/admin?updateMember", {
    id: member.id,
    name: member.name,
    role: member.role,
    unitId: member.unitId ?? 0,
    slackUserId: member.slackUserId ?? "",
  });
  const formId = `edit-member-${member.id}`;
  useEffect(() => {
    if (form.wasSuccessful) onDone();
  }, [form.wasSuccessful, onDone]);

  return (
    <tr>
      <td>
        <input form={formId} aria-label="名前" aria-invalid={Boolean(form.errors.name)} value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
        {form.errors.name && <div className="error" role="alert">{form.errors.name}</div>}
      </td>
      <td className="meta">{member.email}</td>
      <td>
        <select form={formId} aria-label="役割" aria-invalid={Boolean(form.errors.role)} value={form.data.role} disabled={isSelf} onChange={(e) => form.setData("role", e.target.value as typeof form.data.role)}>
          {Object.entries(ROLE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        {isSelf && <div className="hint">自分の役割は変更できません</div>}
        {form.errors.role && <div className="error" role="alert">{form.errors.role}</div>}
      </td>
      <td>
        <select form={formId} aria-label="ユニット" aria-invalid={Boolean(form.errors.unitId)} value={form.data.unitId} onChange={(e) => form.setData("unitId", Number(e.target.value))}>
          <option value={0}>なし</option>
          {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </select>
        {form.errors.unitId && <div className="error" role="alert">{form.errors.unitId}</div>}
      </td>
      <td>
        <input form={formId} aria-label="Slack ID" aria-invalid={Boolean(form.errors.slackUserId)} value={form.data.slackUserId} placeholder="U0123ABCD" onChange={(e) => form.setData("slackUserId", e.target.value)} />
        {form.errors.slackUserId && <div className="error" role="alert">{form.errors.slackUserId}</div>}
      </td>
      <td>
        <Form id={formId} form={form} className="stack" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
            <Button type="submit" className="small primary" disabled={form.pending}>
              <Icon name="check-line" />保存
            </Button>
            <IconButton type="button" className="icon-button" title="キャンセル" aria-label="編集をキャンセル" disabled={form.pending} onClick={onDone}>
              <Icon name="close-line" />
            </IconButton>
          </div>
          {form.errors.id && <div className="error" role="alert">{form.errors.id}</div>}
        </Form>
      </td>
    </tr>
  );
}

function UnitSection({ units }: Pick<Props, "units">) {
  const form = useForm("/admin?addUnit", { name: "", kind: "project" as UnitKind }, { resetOnSuccess: true });
  return (
    <Card as="section" className="card card-lg section">
      <SectionHeader className="section-head">
        <Icon name="flag-line" className="muted" />
        <h2>報告ユニット</h2>
        <Badge className="count">{units.length}</Badge>
      </SectionHeader>
      <p className="hint">進捗を報告する単位です。目的・概要は各ユニットのページで編集できます。</p>
      <ul className="list">
        {units.map((u) => (
          <li key={u.id} className="row">
            <Link href={`/units/${u.id}`}>{u.name}</Link>
            <span className="meta">{UNIT_KIND_LABEL[u.kind]}</span>
          </li>
        ))}
      </ul>
      <Form form={form} className="row" style={{ marginTop: 20 }}>
        <input type="text" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} placeholder="ユニット名" style={{ flex: 1, minWidth: 160 }} />
        <select value={form.data.kind} onChange={(e) => form.setData("kind", e.target.value as UnitKind)} style={{ width: "auto" }}>
          {(Object.keys(UNIT_KIND_LABEL) as UnitKind[]).map((k) => (
            <option key={k} value={k}>
              {UNIT_KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={form.pending}>
          追加
        </Button>
      </Form>
      {form.errors.name && <p className="error">{form.errors.name}</p>}
    </Card>
  );
}
