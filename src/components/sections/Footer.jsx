import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import { landingContent } from "@/content/landing";
import { formatPhoneInternationalBR } from "@/lib/phone";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const socialIconByKey = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

export function Footer() {
  const { brand, footer, whatsapp } = landingContent;
  const formattedWhatsApp = formatPhoneInternationalBR(whatsapp.number);

  const whatsappHref = buildWhatsAppLink({
    phone: whatsapp.number,
    message: whatsapp.message,
  });

  return (
    <footer className="bg-zinc-950 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="text-white font-extrabold tracking-wide text-xl">
              {brand.name}
            </div>
            <p className="mt-4 text-white/70 max-w-md leading-relaxed">
              {footer.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              {footer.socials.map((s) => {
                const Icon = socialIconByKey[s.icon];
                if (!Icon) return null;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-white font-bold">Links Rápidos</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
              {footer.quickLinks.map((l) => (
                <a
                  key={l.href + l.label}
                  href={l.href}
                  className="text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 rounded"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-white font-bold">Contato</h3>
            <div className="mt-4 space-y-3">
              <a
                href={`mailto:${footer.contact.email}`}
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 rounded"
              >
                <Mail className="h-4 w-4" aria-hidden />
                <span>{footer.contact.email}</span>
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 rounded"
              >
                <Phone className="h-4 w-4" aria-hidden />
                <span>{formattedWhatsApp || whatsapp.number}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} {brand.name}. Todos os direitos
            reservados.
          </p>

          <div className="flex gap-6">
            {footer.legalLinks.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                className="text-white/50 hover:text-white/80 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 rounded"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
