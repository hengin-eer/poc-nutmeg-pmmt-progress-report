
import { Hero } from "../components/dashboard/Hero";
import { ItemList } from "../components/dashboard/ItemList";
import { PendingSummary } from "../components/dashboard/PendingSummary";
import { UnitCard } from "../components/dashboard/UnitCard";
import { Card, Link, SectionHeader } from "../components/ui";
import type { Props } from "./index.server";

export default function Dashboard({ me, cycle, cards, liveItems, openItems, pending, now }: Props) {
  if (!cycle) {
    return (
      <Card size="large" className="max-w-[820px]">
        <h1 className="text-title font-extrabold tracking-[.01em] text-text">まだ回がありません</h1>
        <p className="text-body text-text-2">{me.isAdmin ? <Link href="/admin">管理画面</Link> : "局長・副局長が管理画面"}から PMMT の回を作ってください。</p>
      </Card>
    );
  }

  return (
    <>
      <Hero cycle={cycle} cards={cards} unitId={me.unitId} now={now} />
      <section className="mt-10">
        <SectionHeader><h2 className="text-heading font-bold text-text">各ユニット</h2></SectionHeader>
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
          {cards.map((card) => <UnitCard key={card.id} card={card} />)}
        </div>
      </section>
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start max-sm:grid-cols-1 mt-10">
        <ItemList title="当日に話すこと" icon="mic-line" items={liveItems} empty="今のところ、当日の議題はありません" />
        <ItemList title="未解決の確認事項" icon="question-answer-line" items={openItems} empty="未解決の確認事項はありません" moreHref="/items" moreLabel="すべての確認事項" />
      </div>
      <PendingSummary pending={pending} />
    </>
  );
}
