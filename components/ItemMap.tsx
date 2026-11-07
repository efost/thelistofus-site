"use client";

import dynamic from "next/dynamic";
import type { Item } from "@/lib/lists";

const MapPanel = dynamic(() => import("./MapPanel"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-secondary" />,
});

/** A small map with one place's pin. */
export default function ItemMap({ item, className }: { item: Item; className?: string }) {
  return <MapPanel items={[item]} zoom interactive={false} className={className} />;
}
