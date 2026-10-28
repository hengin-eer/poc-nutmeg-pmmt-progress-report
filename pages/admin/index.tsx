import { headingStyles, textStyles } from "../../components/ui/styles";
import { ButtonLink, Icon, PageHeader } from "../../components/ui";
import { CycleSection } from "../../components/admin/CycleSection";
import { MemberSection } from "../../components/admin/MemberSection";
import { UnitSection } from "../../components/admin/UnitSection";
import { type Props } from "./index.server";

export default function AdminPage({ cycles, units, members, defaults }: Props) {
  return (
    <>
      <PageHeader>
        <div>
          <h1 className={headingStyles({ level: "title" })}>管理</h1>
          <div className={textStyles({ role: "lead" })}>局長・副局長だけが使えます</div>
        </div>
        <ButtonLink href="/admin/import" variant="primary">
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
