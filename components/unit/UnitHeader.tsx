import { textStyles } from "../ui/styles";
import { headingStyles } from "../ui/styles";
import { Icon, PageHeader, Row } from "../ui";
import { UNIT_KIND_LABEL } from "../domain";
import { type Props } from "../../pages/units/[id].server";

export function UnitHeader({ unit, people }: Pick<Props, "unit" | "people">) {
  return (
    <PageHeader>
      <div>
        <div className={textStyles({ role: "eyebrow" })}>{UNIT_KIND_LABEL[unit.kind]}</div>
        <h1 className={headingStyles({ level: "title" })}>{unit.name}</h1>
        {people.length > 0 && (
          <Row className="text-caption text-muted mt-1">
            <Icon name="group-line" />
            {people.map((p) => p.name).join("、")}
          </Row>
        )}
      </div>
    </PageHeader>
  );
}
