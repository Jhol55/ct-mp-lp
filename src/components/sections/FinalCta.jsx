import { landingContent } from "@/content/landing";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function FinalCta() {
  const whatsappHref = buildWhatsAppLink({
    phone: landingContent.whatsapp.number,
    message: landingContent.whatsapp.message,
  });

  return (
    <section id="final-cta" className="py-20 sm:py-24 bg-black scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-black p-8 sm:p-12">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-red-600/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />

          <div className="relative text-center">
            <h2 className="text-white font-black text-3xl sm:text-4xl">
              {landingContent.finalCta.title}
            </h2>
            <p className="mt-5 text-white/70 max-w-2xl mx-auto leading-relaxed">
              {landingContent.finalCta.description}
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 flex-col sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold px-8 py-4 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
              >
                {landingContent.finalCta.cta}
              </a>
              <a
                href="#inicio"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-full transition-colors border border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
              >
                Voltar ao topo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
