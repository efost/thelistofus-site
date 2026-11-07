"use client";

import { useEffect } from "react";

// Marks the header once the page scrolls under it, which gives it its shadow and, on pages
// where it sits over the hero wash, its background and blur. On the home page it also
// tracks whether the hero's signup ([data-hero-cta]) is still on screen, so on phones
// the header's own button stays out of the way until then (see SiteHeader and
// globals.css).
export default function HeaderShade() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.site-header");
    if (!header) return;
    const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });

    // "Out of view" means scrolled up under the header, hence the top margin.
    const heroCta = document.querySelector("[data-hero-cta]");
    const observer = heroCta
      ? new IntersectionObserver(
          ([entry]) => header.toggleAttribute("data-hero-cta-visible", entry.isIntersecting),
          { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
        )
      : null;
    if (heroCta && observer) observer.observe(heroCta);
    else header.removeAttribute("data-hero-cta-visible");

    return () => {
      window.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, []);
  return null;
}
