import { Link } from "@void/react";
import { Icon, PageHeader } from "../../components/ui";
import { CycleSection } from "../../components/admin/CycleSection";
import { MemberSection } from "../../components/admin/MemberSection";
import { UnitSection } from "../../components/admin/UnitSection";
import { type Props } from "./index.server";

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
