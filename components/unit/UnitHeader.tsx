import { type Props } from "../../pages/units/[id].server";
import { UNIT_KIND_LABEL } from "../domain";
import { Icon, PageHeader, Row } from "../ui";
import { headingStyles, textStyles } from "../ui/styles";

type UnitHeaderProps = Pick<Props, "unit" | "people">;

export function UnitHeader({ unit, people }: UnitHeaderProps) {
  const hasMembers = people.length > 0;

  return (
    <PageHeader>
      <div>
        <div className={textStyles({ role: "eyebrow" })}>{UNIT_KIND_LABEL[unit.kind]}</div>
        <h1 className={headingStyles({ level: "title" })}>{unit.name}</h1>
        {hasMembers && (
          <Row className="text-caption text-muted mt-1">
            <Icon name="group-line" />
            {people.map((p) => p.name).join("、")}
          </Row>
        )}
      </div>
    </PageHeader>
  );
}
