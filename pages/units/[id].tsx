import { Grid } from "../../components/ui";
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
      <Grid columns="two" className="mt-10">
        <UnitHistory history={history} />
        <UnitRecords records={records} />
      </Grid>
    </>
  );
}
