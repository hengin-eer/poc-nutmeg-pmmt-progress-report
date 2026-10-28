
import { Icon, Link, PageHeader } from "../../components/ui";
import { MinutesInput } from "../../components/admin/MinutesInput";
import { MinutesCandidates } from "../../components/admin/MinutesCandidates";
import { useMinutesImport } from "../../components/admin/useMinutesImport";
import { type Props } from "./import.server";

export default function ImportPage({ cycles, units }: Props) {
  const state = useMinutesImport({ cycles, units });
  return (
    <>
      <nav className="mb-6 flex items-center gap-3 [&>a:first-child]:inline-flex [&>a:first-child]:items-center [&>a:first-child]:gap-2 [&>a:first-child]:text-muted [&>a:first-child]:font-semibold">
        <Link href="/admin">
          <Icon name="arrow-left-line" />
          管理
        </Link>
      </nav>
      <PageHeader>
        <div>
          <h1 className="text-title font-extrabold tracking-[.01em] text-text">議事録・過去の回の取り込み</h1>
          <div className="text-body text-text-2">議事録スキルの出力を貼り付けると、1 件ずつの候補に分かれます。✓ をつけたものだけ記録に登録されます。</div>
        </div>
      </PageHeader>

      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start max-sm:grid-cols-1">
        <MinutesInput state={state} />
        <MinutesCandidates cycles={cycles} units={units} state={state} />
      </div>
    </>
  );
}
