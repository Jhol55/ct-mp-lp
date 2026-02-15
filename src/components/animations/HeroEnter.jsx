import { cn } from "@/lib/utils";

/**
 * HeroEnter
 * - Pure CSS entrance animation (no client/hydration needed).
 * - Gives a "from background to front" feel using scale + blur + opacity.
 */
export function HeroEnter({
  as: Component = "div",
  delayMs = 0,
  durationMs = 900,
  className,
  style,
  children,
}) {
  return (
    <Component
      className={cn(
        "hero-enter will-change-[transform,opacity,filter]",
        className,
      )}
      style={{
        animation: `hero-forward ${durationMs}ms cubic-bezier(.16,1,.3,1) both`,
        animationDelay: `${delayMs}ms`,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
