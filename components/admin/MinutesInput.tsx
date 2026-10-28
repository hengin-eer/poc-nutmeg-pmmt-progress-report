import { type ChangeEvent } from "react";
import { Button, Card, Icon, Link, Row, SectionHeader, Textarea } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";
import { type ImportState } from "./useMinutesImport";

type MinutesInputProps = { state: ImportState };

const SAMPLE = `# PMMT 2026-10-26 議事録

## 決まったこと
- [副局長] 進捗報告は 1 人 3 分まで: テキストで読める内容は話さない

## TODO
- [FinanSu] 購入申請フォームの画面設計を進める

## 先送りした議題
- [局長] 情報局の MVV をいつ決めるか

## 要約
（議事録の要約）`;

export function MinutesInput({ state }: MinutesInputProps) {
  const { text, setText, parse } = state;
  const isParseDisabled = !text.trim();

  function handleMinutesChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
  }

  function handleLoadSample() {
    setText(SAMPLE);
  }

  return (
    <Card as="section" size="large">
      <SectionHeader><span className="grid size-6 shrink-0 place-items-center rounded-full bg-text text-caption font-extrabold text-bg">1</span><h2 className={headingStyles({ level: "heading" })}>議事録を貼り付ける</h2></SectionHeader>
      <p className={textStyles({ className: "mb-3", role: "hint" })}>
        過去の回を取り込む時は、先に<Link href="/admin">管理画面</Link>で過去の日付の回を作ってください。Notion から書き出した Markdown や文字起こしは、スキルで下の形式に変換してから貼り付けます。
      </p>
      <Textarea value={text} onChange={handleMinutesChange} placeholder={SAMPLE} className="min-h-[280px] font-mono text-caption" />
      <Row className="mt-2">
        <Button variant="ghost" size="small" onClick={handleLoadSample}>
          サンプルを入れる
        </Button>
        <span className="flex-1" />
        <Button variant="primary" onClick={parse} disabled={isParseDisabled}>
          候補に分ける
          <Icon name="arrow-right-line" />
        </Button>
      </Row>
    </Card>
  );
}
