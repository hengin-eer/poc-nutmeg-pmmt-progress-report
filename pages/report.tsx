import { ItemSection } from "../components/report/ItemSection";
import { PendingRecords } from "../components/report/PendingRecords";
import { ProgressForm } from "../components/report/ProgressForm";
import { ReportHeader } from "../components/report/ReportHeader";
import { Grid, Stack } from "../components/ui";
import { ITEM_KINDS } from "../lib/domain";
import { type Props } from "./report.server";

export default function ReportPage({ unit, cycle, report, myItems, pending, now }: Props) {
  const isOpen = cycle.status === "open";
  const itemSections = ITEM_KINDS.map((kind) => ({ kind, items: myItems.filter((item) => item.kind === kind) }));
  return (
    <>
      <ReportHeader unit={unit} cycle={cycle} report={report} now={now} />
      <PendingRecords pending={pending} isOpen={isOpen} />
      <Grid columns="two" className="mt-10">
        <ProgressForm unit={unit} cycle={cycle} report={report} />
        <Stack className="gap-6">
          {itemSections.map(({ kind, items }) => (
            <ItemSection key={kind} kind={kind} list={items} isOpen={isOpen} />
          ))}
        </Stack>
      </Grid>
    </>
  );
}
