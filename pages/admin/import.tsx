import { Link } from "@void/react";
import { Icon, PageHeader } from "../../components/ui";
import { MinutesInput } from "../../components/admin/MinutesInput";
import { MinutesCandidates } from "../../components/admin/MinutesCandidates";
import { useMinutesImport } from "../../components/admin/useMinutesImport";
import { type Props } from "./import.server";

export default function ImportPage({ cycles, units }: Props) {
  const state = useMinutesImport({ cycles, units });
  return (
    <>
      <nav className="crumbs">
        <Link href="/admin">
          <Icon name="arrow-left-line" />
          管理
        </Link>
      </nav>
      <PageHeader className="page-head">
        <div>
          <h1>議事録・過去の回の取り込み</h1>
          <div className="lead">議事録スキルの出力を貼り付けると、1 件ずつの候補に分かれます。✓ をつけたものだけ記録に登録されます。</div>
        </div>
      </PageHeader>

      <div className="grid grid-2">
        <MinutesInput state={state} />
        <MinutesCandidates cycles={cycles} units={units} state={state} />
      </div>
    </>
  );
}
