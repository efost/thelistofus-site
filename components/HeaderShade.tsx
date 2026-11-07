"use client";

import { useEffect } from "react";

// On pages where the header sits over the hero wash, it starts transparent and picks up
// its blur and hairline once the page scrolls (see SiteHeader and globals.css).
export default function HeaderShade() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header[data-overlay]");
    if (!header) return;
    const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return null;
}
