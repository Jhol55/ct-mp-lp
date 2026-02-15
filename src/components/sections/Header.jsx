"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { landingContent } from "@/content/landing";
import { buildWhatsAppLink } from "@/lib/whatsapp";

function NavLink({ href, children, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
    >
      {children}
    </a>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappHref = useMemo(() => {
    return buildWhatsAppLink({
      phone: landingContent.whatsapp.number,
      message: landingContent.whatsapp.message,
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (!mobileOpen) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-50",
        "transition-colors",
        scrolled ? "bg-black/75 backdrop-blur border-b border-white/10" : "",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          <a
            href="#inicio"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 rounded inline-flex items-center"
          >
            <Image
              src="/images/logo.svg"
              alt={landingContent.brand.name}
              width={320}
              height={56}
              className="h-7 sm:h-8 w-auto"
              priority
            />
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {landingContent.nav.items.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold px-4 py-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
            >
              {landingContent.nav.ctaLabel}
            </a>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 text-white/90 hover:text-white hover:border-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 mr-1 sm:mr-0"
              aria-label="Abrir menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <title>Menu</title>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-col gap-1">
            {landingContent.nav.items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold px-4 py-2 rounded-full transition-colors justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
              onClick={() => setMobileOpen(false)}
            >
              {landingContent.nav.ctaLabel}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
