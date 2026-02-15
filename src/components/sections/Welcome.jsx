import { SplitSlideIn } from "@/components/animations/SplitSlideIn";
import { landingContent } from "@/content/landing";
import { Icon } from "./icons";

function Card({ icon, title, description }) {
  return (
    <div className="group rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-7 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/15 focus-within:border-white/15">
      <div className="grid grid-cols-[auto,1fr] items-start gap-x-4 sm:block">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-0 sm:mb-5">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <h3 className="text-white text-xl font-bold leading-snug">
          {title}
        </h3>
        <p className="mt-3 text-white/70 leading-relaxed col-start-2 sm:col-start-auto">
          {description}
        </p>
      </div>
    </div>
  );
}

export function Welcome() {
  const { welcome } = landingContent;

  return (
    <section
      id={welcome.id}
      className="py-20 sm:py-24 bg-gradient-to-b from-black to-zinc-950 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-white font-black text-4xl sm:text-5xl">
            {welcome.title}
          </h2>
          <div className="mt-4 flex items-center justify-center">
            <span className="h-[3px] w-24 bg-red-600 rounded-full" />
          </div>
          <p className="mt-6 text-white/70 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            {welcome.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {welcome.cards.map((card, index) => (
            <SplitSlideIn key={card.title} index={index} splitAt={2}>
              <Card {...card} />
            </SplitSlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
