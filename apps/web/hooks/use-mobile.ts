"use client";

import { useEffect, useState } from "react";

export const BREAKPOINTS = { mobile: 640, tablet: 980, desktop: 1180 } as const;

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [query]);
  return matches;
}

export function useIsMobile() { return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`); }
export function useIsTablet() { return useMediaQuery(`(max-width: ${BREAKPOINTS.tablet}px)`); }
export function useViewportClass() {
  const mobile = useIsMobile();
  const tablet = useIsTablet();
  return mobile ? "mobile" : tablet ? "tablet" : "desktop";
}
