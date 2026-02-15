import { landingContent } from "@/content/landing";

function formatAddressLine(address) {
  const parts = [
    address.streetAddress,
    address.neighborhood,
    `${address.addressLocality} - ${address.addressRegion}`,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
}

export function Locations() {
  const { locations } = landingContent;

  return (
    <section
      id={locations.id}
      className="py-14 sm:py-16 bg-black scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-white font-black text-3xl sm:text-4xl">
            {locations.title}
          </h2>
          <div className="mt-4 flex items-center justify-center">
            <span className="h-[3px] w-24 bg-red-600 rounded-full" />
          </div>
          <p className="mt-5 text-white/70 max-w-2xl mx-auto leading-relaxed">
            {locations.description}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.items.map((unit) => (
            <div
              key={unit.name}
              className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-7 hover:border-white/15 transition-colors"
            >
              <h3 className="text-white text-xl font-extrabold leading-snug">
                {unit.name}
              </h3>

              <address className="mt-3 not-italic text-white/70 leading-relaxed">
                {formatAddressLine(unit.address)}
              </address>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <a
                  href={unit.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold px-5 py-3 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                >
                  Abrir no Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

