import { Grid, Stack } from "../components/ui";
import { ItemSection } from "../components/report/ItemSection";
import { PendingRecords } from "../components/report/PendingRecords";
import { ProgressForm } from "../components/report/ProgressForm";
import { ReportHeader } from "../components/report/ReportHeader";
import type { Props } from "./report.server";

export default function ReportPage({ unit, cycle, report, myItems, pending, now }: Props) {
  const isOpen = cycle.status === "open";
  return (
    <>
      <ReportHeader unit={unit} cycle={cycle} report={report} now={now} />
      <PendingRecords pending={pending} isOpen={isOpen} />
      <Grid columns="two" className="mt-10">
        <ProgressForm unit={unit} cycle={cycle} report={report} />
        <Stack className="gap-6">
          <ItemSection
            title="確認したいこと"
            kind="confirm"
            hint="判断や返事がほしいことを 1 件ずつ"
            list={myItems.filter((i) => i.kind === "confirm")}
            isOpen={isOpen}
          />
          <ItemSection
            title="話したいこと"
            kind="talk"
            hint="小話・アイデア・耳寄りな情報（任意）"
            list={myItems.filter((i) => i.kind === "talk")}
            isOpen={isOpen}
          />
        </Stack>
      </Grid>
    </>
  );
}
