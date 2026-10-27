// デモ用のサンプルデータ。名前やアドレスは架空（年度 99 = ダミー）。
// 実際の運用では、管理画面からユニット・メンバーを登録する。
import { defineSeed } from "void/seed";
import { defaultSchedule } from "../lib/domain";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default defineSeed<typeof import("./schema")>(async ({ db, schema }) => {
  const s = schema;

  // ---- 報告ユニット（プロジェクト 4・チーム 4・局長・副局長） ----
  const unitRows = [
    { name: "FinanSu", kind: "project", purpose: "技大祭のお金の流れを、誰でも正しく記録・確認できるようにする", summary: "実行委員の購入申請・会計処理を管理する Web アプリ" },
    { name: "SeeFT", kind: "project", purpose: "シフト作成の手間を減らし、当日の人手不足をなくす", summary: "技大祭準備・当日のシフトを管理する Web アプリ" },
    { name: "Group-Manager", kind: "project", purpose: "参加団体とのやりとりを 1 か所にまとめる", summary: "参加団体の申請項目を管理する Web アプリ" },
    { name: "HomePage", kind: "project", purpose: "来場者に技大祭の魅力を伝える", summary: "毎年のテーマに合わせて作り直す公式サイト" },
    { name: "Seeds", kind: "team", purpose: "新入生が自走できるまで育てる", summary: "NUTMEG 内の学習・理解度の管理" },
    { name: "Design Team", kind: "team", purpose: "NUTMEG のプロダクトを使いやすく・美しくする", summary: "UI/UX デザイン" },
    { name: "Infra Team", kind: "team", purpose: "全プロダクトが安定して動く土台を作る", summary: "オンプレサーバー・Cloudflare などの基盤" },
    { name: "DS Team", kind: "team", purpose: "データで技大祭をよくする", summary: "来場者データなどの収集・分析・可視化" },
    { name: "局長", kind: "chief", purpose: "実行委員の視点で、他局・執行部との連携を伝える", summary: "執行部での共有事項、他局からの問い合わせなど" },
    { name: "副局長", kind: "vice", purpose: "情報局の視点で、局運営の状況を伝える", summary: "局運営・制度・イベント企画など" },
  ] as const;
  const unitList = await db
    .insert(s.units)
    .values(unitRows.map((u, i) => ({ ...u, sortOrder: i })))
    .returning();
  const U = Object.fromEntries(unitList.map((u) => [u.name, u.id])) as Record<(typeof unitRows)[number]["name"], number>;

  // ---- メンバー ----
  const memberRows = [
    { name: "会田 さくら", email: "99.a.aida.nutfes@gmail.com", role: "lead", unitId: U.FinanSu },
    { name: "井上 蓮", email: "99.r.inoue.nutfes@gmail.com", role: "lead", unitId: U.SeeFT },
    { name: "上野 結衣", email: "99.y.ueno.nutfes@gmail.com", role: "lead", unitId: U["Group-Manager"] },
    { name: "江口 湊", email: "99.m.eguchi.nutfes@gmail.com", role: "lead", unitId: U.HomePage },
    { name: "大野 葵", email: "99.a.ono.nutfes@gmail.com", role: "lead", unitId: U.Seeds },
    { name: "加藤 陽向", email: "99.h.kato.nutfes@gmail.com", role: "lead", unitId: U["Design Team"] },
    { name: "木村 悠真", email: "99.y.kimura.nutfes@gmail.com", role: "lead", unitId: U["Infra Team"] },
    { name: "久保 芽依", email: "99.m.kubo.nutfes@gmail.com", role: "lead", unitId: U["DS Team"] },
    { name: "小林 大和（局長）", email: "99.y.kobayashi.nutfes@gmail.com", role: "chief", unitId: U["局長"] },
    { name: "佐藤 智（副局長）", email: "99.s.sato.nutfes@gmail.com", role: "vice", unitId: U["副局長"] },
  ] as const;
  const memberList = await db.insert(s.members).values([...memberRows]).returning();
  const M = Object.fromEntries(memberList.map((m) => [m.unitId!, m.id])) as Record<number, number>;
  const lead = (unit: keyof typeof U) => M[U[unit]];

  // ---- 回：過去 2 回（閉じた）+ 今の回 ----
  const { meetingAt, deadlineAt } = defaultSchedule(new Date());
  const at = (d: Date, weeksAgo: number) => new Date(d.getTime() - weeksAgo * WEEK).toISOString();
  const [past2, past1, current] = await db
    .insert(s.cycles)
    .values([
      { meetingAt: at(meetingAt, 2), deadlineAt: at(deadlineAt, 2), status: "closed", minutesSummary: "46th 最初の PMMT。各ユニットの体制と今期の目標を共有した。", remind48SentAt: "x", remind24SentAt: "x", deadlineSentAt: "x" },
      { meetingAt: at(meetingAt, 1), deadlineAt: at(deadlineAt, 1), status: "closed", minutesSummary: "所属存続アンケートと局の MVV について議論。MVV は継続議論に。", remind48SentAt: "x", remind24SentAt: "x", deadlineSentAt: "x" },
      { meetingAt: meetingAt.toISOString(), deadlineAt: deadlineAt.toISOString(), status: "open" },
    ])
    .returning();

  // ---- 過去の回の記録 ----
  await db.insert(s.records).values([
    { kind: "decision", title: "PMMT の進捗報告は 1 人 3 分まで", body: "テキストで読める内容は話さない。確認事項と話したいことに絞る。", unitId: U["副局長"], cycleId: past2.id, source: "minutes" },
    { kind: "decision", title: "事前記入は PMMT の前日までに終える", body: "", unitId: U["副局長"], cycleId: past2.id, source: "minutes" },
    { kind: "todo", title: "所属存続アンケートのリマインドを送る", body: "回答状況を次回の PMMT で確認する", unitId: U["副局長"], cycleId: past1.id, source: "minutes", doneAt: new Date().toISOString() },
    { kind: "todo", title: "FinanSu の購入申請フォームの要件をまとめる", body: "", unitId: U.FinanSu, cycleId: past1.id, source: "minutes" },
    { kind: "todo", title: "新入生向けハンズオンの日程を決める", body: "", unitId: U.Seeds, cycleId: past1.id, source: "minutes" },
    { kind: "carryover", title: "情報局の MVV をいつ決めるか", body: "副局長がたたき台を作ってから議論する", unitId: U["局長"], cycleId: past1.id, source: "minutes" },
  ]);

  // ---- 今の回の事前記入（10 人中 6 人が提出済み） ----
  const submitted = new Date(deadlineAt.getTime() - 30 * 60 * 60 * 1000).toISOString();
  await db.insert(s.reports).values([
    { cycleId: current.id, unitId: U.FinanSu, authorId: lead("FinanSu"), progress: "green", busyness: 2, done: "- 購入申請フォームの要件をまとめた\n- 会計局と打ち合わせ", next: "- フォームの画面設計", submittedAt: submitted },
    { cycleId: current.id, unitId: U.SeeFT, authorId: lead("SeeFT"), progress: "yellow", busyness: 3, done: "- シフト自動生成のロジックを試作\n- 担当者 2 名が試験期間で離脱", next: "- 作業の優先度を見直す", submittedAt: submitted },
    { cycleId: current.id, unitId: U["Infra Team"], authorId: lead("Infra Team"), busyness: 1, done: "- サーバーの OS アップデート", next: "- バックアップの手順書を作る", submittedAt: submitted },
    { cycleId: current.id, unitId: U["Design Team"], authorId: lead("Design Team"), busyness: 2, done: "- HomePage のトップのラフ案を 3 つ作成", next: "- 案を絞って HomePage チームとレビュー", submittedAt: submitted },
    { cycleId: current.id, unitId: U["局長"], authorId: lead("局長"), busyness: 3, done: "- 執行部 MT で各局の進捗共有\n- 広報局から HP 公開時期の問い合わせ", next: "- 他局向けツール説明会の調整", submittedAt: submitted },
    { cycleId: current.id, unitId: U["副局長"], authorId: lead("副局長"), busyness: 2, done: "- 進捗確認アプリのプロトタイプ作成\n- MVV のたたき台作成", next: "- PMMT で MVV のたたき台を共有", submittedAt: submitted },
    { cycleId: current.id, unitId: U.HomePage, authorId: lead("HomePage"), progress: "green", busyness: 2, done: "- 今年のテーマを実行委員から受け取った", next: "" },
  ]);

  // ---- 確認したいこと・話したいこと ----
  const itemList = await db
    .insert(s.items)
    .values([
      { cycleId: current.id, unitId: U.SeeFT, authorId: lead("SeeFT"), kind: "confirm", body: "試験期間で人手が足りないので、11 月中のマイルストーンを 1 週間後ろにずらしてもいい？" },
      { cycleId: current.id, unitId: U["局長"], authorId: lead("局長"), kind: "confirm", body: "広報局から HP の公開時期を聞かれている。12 月上旬と答えていい？", crossBureau: true },
      { cycleId: current.id, unitId: U.FinanSu, authorId: lead("FinanSu"), kind: "confirm", body: "購入申請フォームの項目を会計局にレビューしてもらいたい。窓口は局長経由で合ってる？", crossBureau: true },
      { cycleId: current.id, unitId: U["副局長"], authorId: lead("副局長"), kind: "confirm", body: "MVV のたたき台を作ったので、PMMT 当日に 15 分ほしい", state: "live" },
      { cycleId: current.id, unitId: U["Design Team"], authorId: lead("Design Team"), kind: "talk", body: "Figma のチームライブラリを整理したので、各プロジェクトで使ってみてほしい" },
      { cycleId: current.id, unitId: U["Infra Team"], authorId: lead("Infra Team"), kind: "confirm", body: "バックアップ用の外付け HDD を買いたい（1 万円くらい）。予算申請していい？", state: "decided", resolutionNote: "OK。FinanSu で申請する", closedById: lead("副局長"), closedAt: new Date().toISOString() },
    ])
    .returning();

  await db.insert(s.comments).values([
    { itemId: itemList[0].id, authorId: lead("副局長"), body: "後ろにずらすのは OK。ずらした後のマイルストーンを書いておいてもらえると助かる" },
    { itemId: itemList[1].id, authorId: lead("HomePage"), body: "デザインが固まるのが 11 月末の予定なので、12 月上旬なら間に合いそう" },
    { itemId: itemList[5].id, authorId: lead("副局長"), body: "OK！FinanSu で申請してください" },
  ]);
  await db.insert(s.reactions).values([
    { itemId: itemList[0].id, memberId: lead("局長"), emoji: "👀" },
    { itemId: itemList[1].id, memberId: lead("副局長"), emoji: "👍" },
    { itemId: itemList[4].id, memberId: lead("HomePage"), emoji: "🎉" },
    { itemId: itemList[4].id, memberId: lead("FinanSu"), emoji: "👍" },
  ]);
  await db.insert(s.records).values({
    kind: "decision",
    title: "Infra Team のバックアップ用 HDD を購入する",
    body: "OK。FinanSu で申請する",
    unitId: U["Infra Team"],
    cycleId: current.id,
    sourceItemId: itemList[5].id,
    source: "thread",
  });
});
