import { Icon, PageHeader } from "../ui";
import { UNIT_KIND_LABEL } from "../domain";
import { type Props } from "../../pages/units/[id].server";

export function UnitHeader({ unit, people }: Pick<Props, "unit" | "people">) {
  return (
    <PageHeader className="page-head">
      <div>
        <div className="eyebrow">{UNIT_KIND_LABEL[unit.kind]}</div>
        <h1>{unit.name}</h1>
        {people.length > 0 && (
          <div className="sub row" style={{ marginTop: 6 }}>
            <Icon name="group-line" />
            {people.map((p) => p.name).join("、")}
          </div>
        )}
      </div>
    </PageHeader>
  );
}
