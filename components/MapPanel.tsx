"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { fallbackEmoji } from "@/lib/categories";
import type { Item } from "@/lib/lists";
import { itemPath } from "@/lib/site";

// The list's places on a map, with the app's gradient pins (grey once done).
// Tiles are OpenStreetMap's, darkened in dark mode.

type Leaflet = typeof import("leaflet");

function escapeHTML(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
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
  /** Fixed zoom for a single place; otherwise fits all pins. */
  zoom?: number;
  interactive?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const L = useRef<Leaflet | null>(null);
  const markers = useRef(new Map<string, import("leaflet").Marker>());
  const placed = items.filter((i) => i.lat !== null && i.long !== null);
  const key = placed.map((i) => i.id).join(",");

  // Create the map once.
  useEffect(() => {
    let disposed = false;
    const pins = markers.current;
    (async () => {
      const leaflet = await import("leaflet");
      if (disposed || !container.current) return;
      L.current = leaflet;
      const m = leaflet.map(container.current, {
        zoomControl: interactive,
        scrollWheelZoom: false,
        dragging: interactive,
        attributionControl: true,
      });
      // OpenStreetMap's own tiles (light use, with attribution, is within their policy).
      // Dark mode darkens them with a CSS filter (.list-map-tiles in globals.css).
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          className: "list-map-tiles",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(m);
      map.current = m;
      // Redraw pins now that the map exists.
      setPins(leaflet, m);
    })();
    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
      pins.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setPins(leaflet: Leaflet, m: import("leaflet").Map) {
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();
    if (!placed.length) return;
    for (const item of placed) {
      const icon = leaflet.divIcon({
        className: "",
        html: `<div class="list-pin ${item.done ? "is-done" : ""}"><span>${fallbackEmoji(item.category)}</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 34],
        popupAnchor: [0, -32],
      });
      const marker = leaflet
        .marker([item.lat!, item.long!], { icon, title: item.name, keyboard: interactive })
        .addTo(m);
      if (interactive) {
        marker.bindPopup(
          `<a href="${itemPath(item.listId, item.id)}" style="font-family:var(--font-heading);font-weight:700;font-size:15px;color:inherit;text-decoration:none">${escapeHTML(item.name)}</a>${
            item.city
              ? `<div style="color:#636366;font-size:13px;margin-top:2px">${escapeHTML(item.city)}</div>`
              : ""
          }`,
        );
      }
      markers.current.set(item.id, marker);
    }
    if (placed.length === 1 || zoom) {
      m.setView([placed[0].lat!, placed[0].long!], zoom ?? 14);
    } else {
      m.fitBounds(leaflet.latLngBounds(placed.map((i) => [i.lat!, i.long!] as [number, number])), {
        padding: [36, 36],
        maxZoom: 15,
      });
    }
  }

  // Redraw when the shown items change (tab, search, category).
  useEffect(() => {
    if (L.current && map.current) setPins(L.current, map.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Highlight the pin for the hovered row.
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      const el = marker.getElement()?.firstElementChild;
      el?.classList.toggle("is-active", id === activeId);
      if (id === activeId) marker.setZIndexOffset(1000);
      else marker.setZIndexOffset(0);
    });
  }, [activeId, key]);

  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div ref={container} className="absolute inset-0" />
      {!placed.length && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-surface-secondary text-[15px] text-muted">
          Nothing here has a place on the map.
        </div>
      )}
    </div>
  );
}
