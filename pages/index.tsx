import { Link } from "@void/react";
import { Hero } from "../components/dashboard/Hero";
import { ItemList } from "../components/dashboard/ItemList";
import { PendingSummary } from "../components/dashboard/PendingSummary";
import { UnitCard } from "../components/dashboard/UnitCard";
import { Card, SectionHeader } from "../components/ui";
import type { Props } from "./index.server";

export default function Dashboard({ me, cycle, cards, liveItems, openItems, pending, now }: Props) {
  const canCreateCycle = me.isAdmin;
  if (!cycle) {
    return (
      <Card className="card card-lg narrow">
        <h1>まだ回がありません</h1>
        <p className="lead">{canCreateCycle ? <Link href="/admin">管理画面</Link> : "局長・副局長が管理画面"}から PMMT の回を作ってください。</p>
      </Card>
    );
  }

  return (
    <>
      <Hero cycle={cycle} cards={cards} unitId={me.unitId} now={now} />
      <section className="section">
        <SectionHeader className="section-head"><h2>各ユニット</h2></SectionHeader>
        <div className="grid grid-cards">
          {cards.map((card) => <UnitCard key={card.id} card={card} />)}
        </div>
      </section>
      <div className="grid grid-2 section">
        <ItemList title="当日に話すこと" icon="mic-line" items={liveItems} empty="今のところ、当日の議題はありません" />
        <ItemList title="未解決の確認事項" icon="question-answer-line" items={openItems} empty="未解決の確認事項はありません" moreHref="/items" moreLabel="すべての確認事項" />
      </div>
      <PendingSummary pending={pending} />
    </>
  );
}
