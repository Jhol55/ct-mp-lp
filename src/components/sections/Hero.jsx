import { HeroEnter } from "@/components/animations/HeroEnter";
import { landingContent } from "@/content/landing";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Hero() {
  const whatsappHref = buildWhatsAppLink({
    phone: landingContent.whatsapp.number,
    message: landingContent.whatsapp.message,
  });

  return (
    <section
      id="inicio"
      className="relative min-h-[92vh] flex items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.85)), url(${landingContent.hero.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 15%",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-16 w-full">
        <div className="text-center">
          {/* <HeroEnter delayMs={0}>
            <p className="text-white/85 tracking-[0.25em] font-semibold text-xs sm:text-sm uppercase">
              {landingContent.brand.name}
            </p>
          </HeroEnter> */}

          <HeroEnter delayMs={120}>
            <h1 className="mt-3 text-white font-black tracking-wide text-5xl sm:text-6xl md:text-7xl">
              {landingContent.hero.headline}
            </h1>
          </HeroEnter>

          <HeroEnter delayMs={220} durationMs={800}>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="h-[3px] w-20 bg-red-600 rounded-full" />
            </div>
          </HeroEnter>

          <HeroEnter delayMs={300}>
            <p className="mt-6 text-white/85 text-lg sm:text-xl">
              {landingContent.hero.subheadline}
            </p>
            <p className="mt-2 text-red-400/90 font-semibold text-base sm:text-lg">
              {landingContent.hero.highlight}
            </p>
          </HeroEnter>

          <HeroEnter delayMs={420} durationMs={950}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold px-8 py-4 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
              >
                {landingContent.hero.primaryCta}
              </a>
              <a
                href="#sobre"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-full transition-colors border border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
              >
                Conhecer o CT
              </a>
            </div>
          </HeroEnter>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
