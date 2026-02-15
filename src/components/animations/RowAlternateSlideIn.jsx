"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

function getColumns(width) {
  // Mirrors Tailwind breakpoints: sm=640, lg=1024
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

/**
 * RowAlternateSlideIn
 * - Wraps AnimateOnScroll and picks animation direction by ROW parity.
 * - Row1 (odd): right->left (slideLeft)
 * - Row2 (even): left->right (slideRight)
 * - Works responsively for 1/2/3 columns.
 */
export function RowAlternateSlideIn({
  index,
  className,
  delayStep = 0.07,
  duration = 0.9,
  children,
}) {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => setCols(getColumns(window.innerWidth));
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  const animation = useMemo(() => {
    const row = Math.floor(index / Math.max(1, cols));
    // row=0 => line 1 (odd) => right->left
    return row % 2 === 0 ? "slideLeft" : "slideRight";
  }, [cols, index]);

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
