"use client";

import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

/**
 * SplitSlideIn
 * - For a fixed set of items, animate first half from left->right and second half from right->left.
 *
 * Defaults:
 * - splitAt=2 (good for 4 cards: 0-1 slideRight, 2-3 slideLeft)
 */
export function SplitSlideIn({
  index,
  splitAt = 2,
  className,
  delayStep = 0.08,
  duration = 0.9,
  children,
}) {
  const animation = index < splitAt ? "slideRight" : "slideLeft";

  return (
    <AnimateOnScroll
      className={className}
      animation={animation}
      delay={index * delayStep}
      duration={duration}
    >
      {children}
    </AnimateOnScroll>
  );
}
