import { UnitHeader } from "../../components/unit/UnitHeader";
import { UnitHistory } from "../../components/unit/UnitHistory";
import { UnitPurpose } from "../../components/unit/UnitPurpose";
import { UnitRecords } from "../../components/unit/UnitRecords";
import type { Props } from "./[id].server";

export default function UnitPage({ unit, people, history, records, canEdit }: Props) {
  return (
    <>
      <UnitHeader unit={unit} people={people} />
      <UnitPurpose unit={unit} canEdit={canEdit} />
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start max-sm:grid-cols-1 mt-10">
        <UnitHistory history={history} />
        <UnitRecords records={records} />
      </div>
    </>
  );
}
