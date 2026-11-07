"use client";

import { useEffect, useRef, useState } from "react";
import { fallbackEmoji } from "@/lib/categories";
import type { Item } from "@/lib/lists";
import { itemPath } from "@/lib/site";

// The list's places on an Apple map (MapKit JS), with the app's gradient pins (grey
// once done). Tokens come from /api/mapkit-token. Apple's own points of interest are
// hidden so the list's pins are what you see.

/* eslint-disable @typescript-eslint/no-explicit-any */
type MapKit = any;
declare global {
  interface Window {
    mapkit?: MapKit;
  }
}

let ready: Promise<MapKit> | null = null;
// Maps that should show "couldn't load" if there's no token (e.g. keys not set yet).
const onFailure = new Set<() => void>();
let tokenFailed = false;
const fail = () => {
  tokenFailed = true;
  onFailure.forEach((f) => f());
};
function loadMapKit(): Promise<MapKit> {
  ready ??= new Promise<MapKit>((resolve, reject) => {
    const init = () => {
      const mk = window.mapkit;
      if (!mk) return reject(new Error("MapKit didn't load"));
      mk.init({
        authorizationCallback: (done: (token: string) => void) => {
          fetch("/api/mapkit-token")
            .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`token ${r.status}`))))
            .then(done)
            .catch((error) => {
              console.warn("MapKit token:", error);
              fail();
            });
        },
      });
      mk.addEventListener("error", fail);
      resolve(mk);
    };
    if (window.mapkit) return init();
    const el = document.createElement("script");
    el.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";
    el.crossOrigin = "anonymous";
    el.async = true;
    el.onload = init;
    el.onerror = () => {
      ready = null;
      reject(new Error("MapKit didn't load"));
    };
    document.head.appendChild(el);
  });
  return ready;
}

function pinElement(item: Item) {
  const pin = document.createElement("div");
  pin.className = `list-pin ${item.done ? "is-done" : ""}`;
  const emoji = document.createElement("span");
  emoji.textContent = fallbackEmoji(item.category);
  pin.appendChild(emoji);
  return pin;
}

function calloutElement(item: Item) {
  const box = document.createElement("a");
  box.href = itemPath(item.listId, item.id);
  box.className = "list-callout";
  const name = document.createElement("strong");
  name.textContent = item.name;
  box.appendChild(name);
  if (item.city) {
    const city = document.createElement("span");
    city.textContent = item.city;
    box.appendChild(city);
  }
  return box;
}

export default function MapPanel({
  items,
  activeId,
  className = "",
  zoom,
  interactive = true,
}: {
  items: Item[];
  activeId?: string | null;
  className?: string;
  /** Zoom in on a single place instead of fitting all pins. */
  zoom?: boolean;
  interactive?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapKit | null>(null);
  const mk = useRef<MapKit | null>(null);
  const pins = useRef(new Map<string, { annotation: MapKit; el: HTMLElement }>());
  const [failed, setFailed] = useState(false);
  const placed = items.filter((i) => i.lat !== null && i.long !== null);
  const key = placed.map((i) => i.id).join(",");

  // Create the map once.
  useEffect(() => {
    let disposed = false;
    const failed = () => !disposed && setFailed(true);
    if (tokenFailed) failed();
    onFailure.add(failed);
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const scheme = () => {
      if (map.current && mk.current) {
        map.current.colorScheme = dark.matches
          ? mk.current.Map.ColorSchemes.Dark
          : mk.current.Map.ColorSchemes.Light;
      }
    };
    loadMapKit()
      .then((mapkit) => {
        if (disposed || !container.current) return;
        mk.current = mapkit;
        const m = new mapkit.Map(container.current, {
          showsCompass: mapkit.FeatureVisibility.Hidden,
          showsMapTypeControl: false,
          showsZoomControl: interactive,
          showsUserLocationControl: false,
          isRotationEnabled: false,
          isScrollEnabled: interactive,
          isZoomEnabled: interactive,
          pointOfInterestFilter: mapkit.PointOfInterestFilter.excludingAllCategories,
        });
        map.current = m;
        scheme();
        setPins();
      })
      .catch(failed);
    dark.addEventListener("change", scheme);
    return () => {
      disposed = true;
      onFailure.delete(failed);
      dark.removeEventListener("change", scheme);
      map.current?.destroy();
      map.current = null;
      pins.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setPins() {
    const mapkit = mk.current;
    const m = map.current;
    if (!mapkit || !m) return;
    m.removeAnnotations(m.annotations);
    pins.current.clear();
    if (!placed.length) return;
    const annotations = placed.map((item) => {
      const el = pinElement(item);
      const annotation = new mapkit.Annotation(
        new mapkit.Coordinate(item.lat!, item.long!),
        () => el,
        {
          title: item.name,
          anchorOffset: new DOMPoint(0, -4),
          calloutEnabled: interactive,
          callout: interactive
            ? { calloutElementForAnnotation: () => calloutElement(item) }
            : undefined,
          accessibilityLabel: item.name,
        },
      );
      pins.current.set(item.id, { annotation, el });
      return annotation;
    });
    m.addAnnotations(annotations);
    if (placed.length === 1 || zoom) {
      m.region = new mapkit.CoordinateRegion(
        new mapkit.Coordinate(placed[0].lat!, placed[0].long!),
        new mapkit.CoordinateSpan(0.01, 0.01),
      );
    } else {
      m.showItems(annotations, {
        animate: false,
        padding: new mapkit.Padding(48, 40, 40, 40),
        minimumSpan: new mapkit.CoordinateSpan(0.012, 0.012),
      });
    }
  }

  // Redraw when the shown items change (tab, search, category).
  useEffect(() => {
    setPins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Highlight the pin for the hovered row.
  useEffect(() => {
    pins.current.forEach(({ annotation, el }, id) => {
      el.classList.toggle("is-active", id === activeId);
      annotation.displayPriority = id === activeId ? 1000 : 750;
    });
  }, [activeId, key]);

  return (
    <div
      className={`relative isolate overflow-hidden bg-surface-secondary ${failed ? "hidden" : className}`}
    >
      <div ref={container} className="absolute inset-0" />
      {!placed.length && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-secondary text-[15px] text-muted">
          Nothing here has a place on the map.
        </div>
      )}
    </div>
  );
}
