"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  animation?:
    | "fadeIn"
    | "slideUp"
    | "slideLeft"
    | "slideRight"
    | "scale"
    | "fadeInUp"
    | "fadeInDown";
}

export function AnimateOnScroll({
  children,
  className,
  delay = 0,
  duration = 0.9,
  threshold = 0.2,
  // Negative bottom margin means: the element must enter deeper into the viewport to trigger.
  rootMargin = "0px 0px -20% 0px",
  triggerOnce = true,
  animation = "fadeInUp",
}: AnimateOnScrollProps) {
  const [canObserve, setCanObserve] = useState(false);
  const { ref, isInView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
    enabled: canObserve,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanObserve(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const animationClasses = {
    fadeIn: isInView ? "opacity-100" : "opacity-0",
    slideUp: isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
    slideLeft: isInView
      ? "translate-x-0 opacity-100"
      : "translate-x-8 opacity-0",
    slideRight: isInView
      ? "translate-x-0 opacity-100"
      : "-translate-x-8 opacity-0",
    scale: isInView ? "scale-100 opacity-100" : "scale-95 opacity-0",
    fadeInUp: isInView
      ? "translate-y-0 opacity-100"
      : "translate-y-12 opacity-0",
    fadeInDown: isInView
      ? "translate-y-0 opacity-100"
      : "-translate-y-12 opacity-0",
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "transition-all ease-[cubic-bezier(.16,1,.3,1)]",
        animationClasses[animation],
        className,
      )}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
