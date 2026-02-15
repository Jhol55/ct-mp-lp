import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { landingContent } from "@/content/landing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://maodepedra.com.br"),
  title: "CT Mão de Pedra | Muay Thai em Piracicaba - SP",
  description:
    "CT Mão de Pedra: Muay Thai em Piracicaba/SP para todos os níveis. Unidades em Perdizes e Água Branca. Treino, disciplina e evolução. Agende sua aula experimental pelo WhatsApp.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CT Mão de Pedra | Muay Thai em Piracicaba - SP",
    description:
      "CT Mão de Pedra: Muay Thai em Piracicaba/SP para todos os níveis. Unidades em Perdizes e Água Branca. Agende sua aula experimental pelo WhatsApp.",
    url: "/",
    siteName: "CT Mão de Pedra",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CT Mão de Pedra | Muay Thai em Piracicaba - SP",
    description:
      "CT Mão de Pedra: Muay Thai em Piracicaba/SP para todos os níveis. Unidades em Perdizes e Água Branca.",
  },
  keywords: [
    "muay thai",
    "muay thai piracicaba",
    "ct muay thai piracicaba",
    "aula de muay thai piracicaba",
    "muay thai perdizes piracicaba",
    "muay thai água branca piracicaba",
    "academia muay thai piracicaba",
    "centro de treinamento muay thai",
    "ct mão de pedra",
  ],
};

export default function RootLayout({ children }) {
  const siteUrl = "https://maodepedra.com.br";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "CT Mão de Pedra",
        url: `${siteUrl}/`,
        sameAs: landingContent.footer?.socials
          ?.map((s) => s?.href)
          ?.filter(Boolean),
      },
      ...landingContent.locations.items.map((unit) => ({
        "@type": "SportsActivityLocation",
        "@id": `${siteUrl}/#${unit.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}`,
        name: `CT Mão de Pedra - ${unit.name}`,
        url: `${siteUrl}/#${landingContent.locations.id}`,
        parentOrganization: { "@id": `${siteUrl}/#organization` },
        sport: "Muay Thai",
        hasMap: unit.mapsUrl,
        address: {
          "@type": "PostalAddress",
          streetAddress: unit.address.streetAddress,
          addressLocality: unit.address.addressLocality,
          addressRegion: unit.address.addressRegion,
          postalCode: unit.address.postalCode,
          addressCountry: unit.address.addressCountry,
        },
      })),
    ],
  };

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
