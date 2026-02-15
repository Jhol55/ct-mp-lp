"use client";

import { InView } from "./InView";

/**
 * SlideIn
 * - Uses InView to trigger a slide+fade transition.
 * - Direction is controlled via CSS var `--slide-x` on the element.
 *   Example: style={{ "--slide-x": "28px" }} or "-28px"
 */
export function SlideIn({
  as = "div",
  once = true,
  threshold,
  rootMargin,
  delayMs = 0,
  durationMs = 650,
  className = "",
  style,
  children,
}) {
  return (
    <InView
      as={as}
      once={once}
      threshold={threshold}
      rootMargin={rootMargin}
      className={({ inView }) =>
        [
          className,
          "transform-gpu will-change-transform",
          "transition-[transform,opacity] ease-[cubic-bezier(.16,1,.3,1)]",
          inView
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-[var(--slide-x)]",
          "motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none",
        ].join(" ")
      }
      style={({ inView }) => ({
        transitionDelay: `${delayMs}ms`,
        transitionDuration: `${durationMs}ms`,
        // If motion is reduced we still pass through user styles, but transitions are disabled via class.
        ...style,
        // When not yet in view, make sure the var exists for Tailwind's translate-x-[var(--slide-x)].
        ...(inView ? null : null),
      })}
    >
      {children}
    </InView>
  );
}
