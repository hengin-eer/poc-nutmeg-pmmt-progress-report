import { useEffect, useState } from "react";
import { ThreadView } from "../../components/thread";
import { ButtonLink, Card, Icon, Link } from "../../components/ui";
import type { Props } from "./[id].server";

export default function ItemPage({ data: initial, cycleOpen }: Props) {
  const [data, setData] = useState(initial);
  useEffect(() => setData(initial), [initial]);

  return (
    <div className="max-w-[820px]">
      <nav className="mb-6 flex items-center gap-3 [&>a:first-child]:inline-flex [&>a:first-child]:items-center [&>a:first-child]:gap-2 [&>a:first-child]:text-muted [&>a:first-child]:font-semibold">
        <Link href="/items">
          <Icon name="arrow-left-line" />
          確認事項
        </Link>
        <span className="flex-1" />
        {/* 自分のユニットの確認事項なら、事前記入に戻れるように */}
        {data.isMine && cycleOpen && (
          <ButtonLink href="/report" >
            <Icon name="edit-box-line" />
            事前記入に戻る
          </ButtonLink>
        )}
      </nav>
      <Card size="large">
        <ThreadView data={data} onChange={setData} />
      </Card>
    </div>
  );
}
