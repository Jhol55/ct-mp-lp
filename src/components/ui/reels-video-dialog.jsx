"use client";

import { Play, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function ReelsVideoDialog({
  videoSrc,
  thumbnailSrc,
  thumbnailTimeSec,
  thumbnailAlt = "Abrir vídeo",
  label = "Assistir",
  className,
}) {
  const [open, setOpen] = useState(false);
  const [generatedThumbSrc, setGeneratedThumbSrc] = useState(null);
  const dialogTitleId = useId();
  const modalVideoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        const video = document.createElement("video");
        video.src = videoSrc;
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        video.crossOrigin = "anonymous";

        const MAX_ATTEMPTS = 3;
        const DARK_LUMA_THRESHOLD = 22; // 0..255 (lower = darker)
        let attempt = 0;
        let candidates = [];

        const cleanup = () => {
          try {
            video.pause();
          } catch {
            // ignore
          }
          video.removeEventListener("loadeddata", onLoadedData);
          video.removeEventListener("seeked", onSeeked);
          video.removeEventListener("error", onError);
          video.removeAttribute("src");
          video.load();
        };

        const clampSeekTime = (t) => {
          const duration = Number.isFinite(video.duration) ? video.duration : 0;
          if (!duration) return Math.max(0.2, t);
          return Math.min(Math.max(0.2, t), Math.max(0.2, duration - 0.1));
        };

        const getCandidates = () => {
          const duration = Number.isFinite(video.duration) ? video.duration : 0;
          if (Number.isFinite(thumbnailTimeSec))
            return [clampSeekTime(thumbnailTimeSec)];

          if (duration) {
            return [
              clampSeekTime(Math.max(0.8, duration * 0.05)),
              clampSeekTime(Math.max(1.6, duration * 0.1)),
              clampSeekTime(Math.max(2.5, duration * 0.2)),
            ];
          }

          return [0.8, 1.6, 2.5];
        };

        const seekToAttempt = (nextAttempt) => {
          attempt = nextAttempt;
          const t =
            candidates[Math.min(attempt, candidates.length - 1)] ??
            candidates[0] ??
            0.8;
          try {
            video.currentTime = t;
          } catch {
            capture();
          }
        };

        const isMostlyDark = (imageData) => {
          const data = imageData.data;
          if (!data || data.length < 4) return false;

          let sum = 0;
          let count = 0;
          const stride = 4 * 120; // sample every N pixels (fast)

          for (let i = 0; i < data.length; i += stride) {
            const r = data[i] ?? 0;
            const g = data[i + 1] ?? 0;
            const b = data[i + 2] ?? 0;
            // Perceived luminance
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            sum += luma;
            count += 1;
            if (count >= 2500) break;
          }

          const avg = sum / Math.max(1, count);
          return avg < DARK_LUMA_THRESHOLD;
        };

        const capture = () => {
          const w = video.videoWidth || 0;
          const h = video.videoHeight || 0;
          if (!w || !h) return;

          // Keep it sharp but not huge. Target ~720px width (good for cards).
          const targetW = 720;
          const baseScale = Math.min(1, targetW / w);
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const scale = baseScale * dpr;

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(w * scale));
          canvas.height = Math.max(1, Math.round(h * scale));

          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const sampleW = Math.min(96, canvas.width);
            const sampleH = Math.min(96, canvas.height);
            const img = ctx.getImageData(0, 0, sampleW, sampleH);
            const dark = isMostlyDark(img);
            if (
              dark &&
              attempt + 1 < Math.min(MAX_ATTEMPTS, candidates.length || 1)
            ) {
              seekToAttempt(attempt + 1);
              return;
            }
          } catch {
            // ignore sampling errors (CORS / security)
          }

          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          if (!cancelled) setGeneratedThumbSrc(dataUrl);

          cleanup();
        };

        const onLoadedData = () => {
          candidates = getCandidates();
          attempt = 0;
          seekToAttempt(0);
        };

        const onSeeked = () => {
          capture();
        };

        const onError = () => {
          cleanup();
        };

        video.addEventListener("loadeddata", onLoadedData, { once: true });
        video.addEventListener("seeked", onSeeked);
        video.addEventListener("error", onError, { once: true });

        video.load();
      } catch {
        // ignore
      }
    }

    // If a custom thumbnail is provided, skip generation.
    if (!thumbnailSrc && videoSrc) void generate();

    return () => {
      cancelled = true;
    };
  }, [thumbnailSrc, thumbnailTimeSec, videoSrc]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Open is a user gesture (click), so browsers generally allow starting playback with audio.
    const id = window.requestAnimationFrame(() => {
      const el = modalVideoRef.current;
      if (!el) return;
      el.muted = false;
      // Attempt autoplay; if blocked, user can still press play and audio will be enabled.
      void el.play().catch(() => {});
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 hover:border-white/15 transition-colors"
      >
        <div className="relative h-[520px] sm:h-[560px]">
          <Image
            src={thumbnailSrc ?? generatedThumbSrc ?? "/images/reels-thumb.svg"}
            alt={thumbnailAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            unoptimized
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-600/85 backdrop-blur shadow-lg ring-1 ring-white/10 group-hover:bg-red-600 transition-colors">
              <Play className="h-7 w-7 fill-white text-white translate-x-[1px]" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-left">
            <p className="text-white/90 text-sm font-semibold">Reels • 9:16</p>
          </div>
        </div>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-[min(92vw,420px)]">
            <div className="absolute -inset-10 rounded-[48px] bg-red-600/15 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-2xl">
              <div className="sr-only" id={dialogTitleId}>
                Reels video player
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-10 w-10 rounded-full bg-black/50 text-white ring-1 ring-white/10 hover:bg-black/65 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                aria-label="Fechar"
              >
                <XIcon className="h-5 w-5" />
              </button>

              <div className="relative aspect-[9/16]">
                <video
                  className="h-full w-full object-contain bg-black"
                  src={videoSrc}
                  ref={modalVideoRef}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                >
                  <track
                    kind="captions"
                    src="/captions/reels.vtt"
                    srcLang="pt-BR"
                    label="Português"
                    default
                  />
                </video>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
