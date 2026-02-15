"use client";

import { useEffect, useRef, useState } from "react";

/**
 * InView
 * - Adds `data-inview="true|false"` to its wrapper when it enters/leaves viewport.
 * - Uses IntersectionObserver (no heavy libs).
 *
 * Props:
 * - as: HTML tag (default "div")
 * - once: when true, stays `inView=true` after first entry
 * - threshold, rootMargin: IntersectionObserver options
 * - children: node or render-prop ({ inView })
 */
export function InView({
  as: Component = "div",
  once = true,
  threshold = 0.2,
  rootMargin = "0px 0px -10% 0px",
  className,
  style,
  children,
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback for older environments.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, rootMargin, threshold]);

  const resolvedClassName =
    typeof className === "function" ? className({ inView }) : className;
  const resolvedStyle = typeof style === "function" ? style({ inView }) : style;

  return (
    <Component
      ref={ref}
      data-inview={inView ? "true" : "false"}
      className={resolvedClassName}
      style={resolvedStyle}
    >
      {typeof children === "function" ? children({ inView }) : children}
    </Component>
  );
}
