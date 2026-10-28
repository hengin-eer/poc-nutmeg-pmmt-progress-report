
import { ButtonLink, Icon, Link, PageHeader } from "../../components/ui";
import { CycleSection } from "../../components/admin/CycleSection";
import { MemberSection } from "../../components/admin/MemberSection";
import { UnitSection } from "../../components/admin/UnitSection";
import { type Props } from "./index.server";

export default function AdminPage({ cycles, units, members, defaults }: Props) {
  return (
    <>
      <PageHeader>
        <div>
          <h1 className="text-title font-extrabold tracking-[.01em] text-text">管理</h1>
          <div className="text-body text-text-2">局長・副局長だけが使えます</div>
        </div>
        <ButtonLink href="/admin/import"  variant="primary">
          <Icon name="import-line" />
          議事録・過去の回を取り込む
        </ButtonLink>
      </PageHeader>

      <CycleSection cycles={cycles} defaults={defaults} unitCount={units.length} />
      <MemberSection members={members} units={units} />
      <UnitSection units={units} />
    </>
  );
}
