import { RowAlternateSlideIn } from "@/components/animations/RowAlternateSlideIn";
import { landingContent } from "@/content/landing";
import { Icon } from "./icons";

function BenefitCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-7 sm:p-8 transition-colors hover:border-white/15">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500/25 to-red-500/5 text-white flex items-center justify-center shrink-0">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <h3 className="text-white text-xl font-extrabold leading-snug">
          {title}
        </h3>
      </div>
      <p className="mt-4 text-white/70 leading-relaxed">{description}</p>
    </div>
  );
}

export function Benefits() {
  const { benefits } = landingContent;

  return (
    <section id={benefits.id} className="py-20 sm:py-24 bg-black scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-white font-black text-4xl sm:text-5xl">
            {benefits.title}
          </h2>
          <div className="mt-4 flex items-center justify-center">
            <span className="h-[3px] w-28 bg-red-600 rounded-full" />
          </div>
          <p className="mt-6 text-white/70 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {benefits.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.cards.map((card, index) => (
            <RowAlternateSlideIn key={card.title} index={index}>
              <BenefitCard {...card} />
            </RowAlternateSlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
