import { action, Form, Link, useForm } from "@void/react";
import { useState } from "react";
import { UNIT_KIND_LABEL, type UnitKind } from "../../components/ui";
import { formatJst, toJstInput } from "../../lib/domain";
import type { Props } from "./index.server";

const ROLE_LABEL = { lead: "部門長", chief: "局長", vice: "副局長", viewer: "閲覧のみ" } as const;

export default function AdminPage({ cycles, units, members, defaults }: Props) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>管理</h1>
          <div className="sub">局長・副局長だけが使えます</div>
        </div>
        <Link href="/admin/import" className="button primary">
          議事録・過去の回を取り込む
        </Link>
      </div>

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
    <section className="card">
      <h2>PMMT の回</h2>
      <Form form={form} className="row" style={{ alignItems: "flex-end", marginBottom: 16 }}>
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
        <button type="submit" className="primary" disabled={form.pending}>
          回を作る
        </button>
      </Form>
      {form.errors.deadlineAt && <p className="error">{form.errors.deadlineAt}</p>}
      <p className="hint">新しい回を作ると、開いている回は自動で閉じます（「当日に話す」の残りは先送りとして記録）。過去の日付で作ると、取り込み用の「閉じた回」になります。</p>

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
                      <button
                        className="small primary"
                        onClick={async () => {
                          await action("/admin?updateDeadline", { data: { id: cy.id, deadlineAt: deadline } });
                          setEditing(null);
                        }}
                      >
                        保存
                      </button>
                    </div>
                  ) : (
                    <span className="row">
                      {formatJst(cy.deadlineAt)}
                      {cy.status === "open" && (
                        <button
                          className="ghost small"
                          onClick={() => {
                            setEditing(cy.id);
                            setDeadline(toJstInput(cy.deadlineAt));
                          }}
                        >
                          変更
                        </button>
                      )}
                    </span>
                  )}
                </td>
                <td>
                  {cy.submitted} / {unitCount}
                </td>
                <td>{cy.status === "open" ? <span className="pill green">受付中</span> : <span className="pill">終了</span>}</td>
                <td>
                  {cy.status === "open" && (
                    <button className="small" onClick={() => confirm("この回を閉じますか？") && action("/admin?closeCycle", { data: { id: cy.id } })}>
                      閉じる
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MemberSection({ members, units }: Pick<Props, "members" | "units">) {
  const form = useForm("/admin?addMember", { name: "", email: "", role: "lead" as const, unitId: units[0]?.id ?? 0, slackUserId: "" }, { resetOnSuccess: true });
  const unitName = (id: number | null) => units.find((u) => u.id === id)?.name ?? "—";

  return (
    <section className="card section">
      <h2>メンバー</h2>
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
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td className="meta">{m.email}</td>
                <td>{ROLE_LABEL[m.role]}</td>
                <td>{unitName(m.unitId)}</td>
                <td className="meta">{m.slackUserId ?? "—"}</td>
                <td>
                  <button
                    className="ghost small danger"
                    onClick={async () => {
                      if (!confirm(`${m.name} さんを削除しますか？`)) return;
                      const r = await action("/admin?deleteMember", { data: { id: m.id } });
                      if (!r.ok) alert(r.error.message);
                    }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Form form={form} className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", alignItems: "end", marginTop: 16, gap: 8 }}>
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
        <button type="submit" className="primary" disabled={form.pending}>
          追加
        </button>
      </Form>
    </section>
  );
}

function UnitSection({ units }: Pick<Props, "units">) {
  const form = useForm("/admin?addUnit", { name: "", kind: "project" as UnitKind }, { resetOnSuccess: true });
  return (
    <section className="card section">
      <h2>報告ユニット</h2>
      <p className="hint">進捗を報告する単位です。目的・概要は各ユニットのページで編集できます。</p>
      <ul className="list">
        {units.map((u) => (
          <li key={u.id} className="row">
            <Link href={`/units/${u.id}`}>{u.name}</Link>
            <span className="meta">{UNIT_KIND_LABEL[u.kind]}</span>
          </li>
        ))}
      </ul>
      <Form form={form} className="row" style={{ marginTop: 12 }}>
        <input type="text" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} placeholder="ユニット名" style={{ flex: 1, minWidth: 160 }} />
        <select value={form.data.kind} onChange={(e) => form.setData("kind", e.target.value as UnitKind)} style={{ width: "auto" }}>
          {(Object.keys(UNIT_KIND_LABEL) as UnitKind[]).map((k) => (
            <option key={k} value={k}>
              {UNIT_KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={form.pending}>
          追加
        </button>
      </Form>
      {form.errors.name && <p className="error">{form.errors.name}</p>}
    </section>
  );
}
