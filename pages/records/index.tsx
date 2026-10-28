import { RecordFilters } from "../../components/records/RecordFilters";
import { RecordList } from "../../components/records/RecordList";
import { RecordsHeader } from "../../components/records/RecordsHeader";
import type { Props } from "./index.server";

export default function RecordsPage({ me, filter, list, unitList }: Props) {
  return (
    <>
      <RecordsHeader filter={filter} />
      <RecordFilters filter={filter} list={list} unitList={unitList} />
      <RecordList me={me} list={list} />
    </>
  );
}
