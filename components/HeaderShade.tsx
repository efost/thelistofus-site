"use client";

import { useEffect } from "react";

// Marks the header once the page scrolls under it, which gives it its shadow and, on pages
// where it sits over the hero wash, its background and blur (see SiteHeader and
// globals.css).
export default function HeaderShade() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.site-header");
    if (!header) return;
    const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return null;
}
