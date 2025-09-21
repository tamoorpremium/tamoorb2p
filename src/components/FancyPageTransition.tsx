// FancyPageTransition.tsx
import { useEffect, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const FancyPageTransition = ({ children }: Props) => {
  const { pathname } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef<string>(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      const container = containerRef.current;
      if (container) {
        // Scroll to top smoothly
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

        // Reset initial animation state
        container.style.opacity = "0";
        container.style.transform = "translateY(20px) scale(0.98)";
        container.style.transition =
          "opacity 0.5s ease, transform 0.5s ease";

        // Trigger animation on next frame
        requestAnimationFrame(() => {
          container.style.opacity = "1";
          container.style.transform = "translateY(0) scale(1)";
        });
      }

      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return <div ref={containerRef}>{children}</div>;
};

export default FancyPageTransition;
