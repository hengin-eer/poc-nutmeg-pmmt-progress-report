import type { ChangeEvent } from "react";
import { Link } from "@void/react";
import { Button, Card, Icon, SectionHeader } from "../ui";
import { type ImportState } from "./useMinutesImport";

const SAMPLE = `# PMMT 2026-10-26 議事録

## 決まったこと
- [副局長] 進捗報告は 1 人 3 分まで: テキストで読める内容は話さない

## TODO
- [FinanSu] 購入申請フォームの画面設計を進める

## 先送りした議題
- [局長] 情報局の MVV をいつ決めるか

## 要約
（議事録の要約）`;

type MinutesInputProps = { state: ImportState };

export function MinutesInput({ state }: MinutesInputProps) {
  const { text, setText, parse } = state;
    function handleMinutesChange(e: ChangeEvent<HTMLTextAreaElement>) { return setText(e.target.value); }

  function handleLoadSample() { return setText(SAMPLE); }

  return (
    <Card as="section" className="card card-lg">
      <SectionHeader className="section-head"><span className="step">1</span><h2>議事録を貼り付ける</h2></SectionHeader>
      <p className="hint">
        過去の回を取り込む時は、先に<Link href="/admin">管理画面</Link>で過去の日付の回を作ってください。Notion から書き出した Markdown や文字起こしは、スキルで下の形式に変換してから貼り付けます。
      </p>
      <textarea value={text} onChange={handleMinutesChange} placeholder={SAMPLE} style={{ minHeight: 280, fontFamily: "ui-monospace, monospace", fontSize: 13 }} />
      <div className="row" style={{ marginTop: 8 }}>
        <Button className="ghost small" onClick={handleLoadSample}>
          サンプルを入れる
        </Button>
        <span className="spacer" />
        <Button className="primary" onClick={parse} disabled={!text.trim()}>
          候補に分ける
          <Icon name="arrow-right-line" />
        </Button>
      </div>
    </Card>
  );
}
