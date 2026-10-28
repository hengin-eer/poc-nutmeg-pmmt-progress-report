import { Grid } from "../components/ui";
import { headingStyles, textStyles } from "../components/ui/styles";

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
        <h1 className={headingStyles({ level: "title" })}>まだ回がありません</h1>
        <p className={textStyles({ role: "lead" })}>{me.isAdmin ? <Link href="/admin">管理画面</Link> : "局長・副局長が管理画面"}から PMMT の回を作ってください。</p>
      </Card>
    );
  }

  return (
    <>
      <Hero cycle={cycle} cards={cards} unitId={me.unitId} now={now} />
      <section className="mt-10">
        <SectionHeader><h2 className={headingStyles({ level: "heading" })}>各ユニット</h2></SectionHeader>
        <Grid columns="cards">
          {cards.map((card) => <UnitCard key={card.id} card={card} />)}
        </Grid>
      </section>
      <Grid columns="two" className="mt-10">
        <ItemList title="当日に話すこと" icon="mic-line" items={liveItems} empty="今のところ、当日の議題はありません" />
        <ItemList title="未解決の確認事項" icon="question-answer-line" items={openItems} empty="未解決の確認事項はありません" moreHref="/items" moreLabel="すべての確認事項" />
      </Grid>
      <PendingSummary pending={pending} />
    </>
  );
}
