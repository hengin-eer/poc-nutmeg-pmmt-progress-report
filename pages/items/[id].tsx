import { Link } from "@void/react";
import { useEffect, useState } from "react";
import { ThreadView } from "../../components/thread";
import { Card, Icon } from "../../components/ui";

import type { Props } from "./[id].server";

export default function ItemPage({ data: initial, cycleOpen }: Props) {
  const [data, setData] = useState(initial);
  useEffect(() => setData(initial), [initial]);
  const canReturnToReport = data.isMine && cycleOpen;

  return (
    <div className="narrow">
      <nav className="crumbs">
        <Link href="/items">
          <Icon name="arrow-left-line" />
          確認事項
        </Link>
        <span className="spacer" />
        {/* 自分のユニットの確認事項なら、事前記入に戻れるように */}
        {canReturnToReport && (
          <Link href="/report" className="button">
            <Icon name="edit-box-line" />
            事前記入に戻る
          </Link>
        )}
      </nav>
      <Card className="card card-lg">
        <ThreadView data={data} onChange={setData} />
      </Card>
    </div>
  );
}
