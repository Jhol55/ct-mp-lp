import { ReelsVideoDialog } from "@/components/ui/reels-video-dialog";
import { landingContent } from "@/content/landing";

function VideoItem({ src, featured }) {
  return (
    <div className={[featured ? "lg:row-span-2" : ""].join(" ")}>
      <ReelsVideoDialog videoSrc={src} />
    </div>
  );
}

export function Gallery() {
  const { gallery } = landingContent;

  return (
    <section
      id={gallery.id}
      className="py-20 sm:py-24 bg-gradient-to-b from-black to-zinc-950 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-white font-black text-4xl sm:text-5xl">
            {gallery.title}
          </h2>
          <div className="mt-4 flex items-center justify-center">
            <span className="h-[3px] w-24 bg-red-600 rounded-full" />
          </div>
          <p className="mt-6 text-white/70 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {gallery.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.items
            .filter((item) => item?.kind === "video" && item?.src)
            .map((item) => (
              <VideoItem
                key={item.src}
                src={item.src}
                featured={item.featured}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
