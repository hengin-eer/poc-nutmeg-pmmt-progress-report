import { Icon, PageHeader, Row } from "../ui";
import { UNIT_KIND_LABEL } from "../domain";
import { type Props } from "../../pages/units/[id].server";

export function UnitHeader({ unit, people }: Pick<Props, "unit" | "people">) {
  return (
    <PageHeader>
      <div>
        <div className="mb-1 text-caption font-semibold text-muted">{UNIT_KIND_LABEL[unit.kind]}</div>
        <h1 className="text-title font-extrabold tracking-[.01em] text-text">{unit.name}</h1>
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
