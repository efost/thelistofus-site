"use client";

import dynamic from "next/dynamic";
import { Fragment, useMemo, useState } from "react";
import ItemRow from "@/components/ItemRow";
import { CATEGORIES } from "@/lib/categories";
import type { Item, SharedList } from "@/lib/lists";

const MapPanel = dynamic(() => import("@/components/MapPanel"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-secondary" />,
});

type Tab = "todo" | "done";

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  );
}

function matches(item: Item, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return [item.name, item.city, item.address, item.notes, item.review, item.category].some((f) =>
    f.toLowerCase().includes(q),
  );
}

export default function ListView({
  list,
  cover,
  sidebar,
}: {
  list: SharedList;
  cover: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const todoCount = list.total - list.done;
  // Open on To do, unless everything's done.
  const [tab, setTab] = useState<Tab>(todoCount === 0 && list.done > 0 ? "done" : "todo");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"list" | "map">("list");
  const [hovered, setHovered] = useState<string | null>(null);

  const usedCategories = useMemo(
    () => Object.keys(CATEGORIES).filter((c) => list.items.some((i) => i.category === c)),
    [list.items],
  );
  const hasPlaces = list.items.some((i) => i.lat !== null);
  const showAdder = list.people.length > 1;

  const shown = useMemo(() => {
    const filtered = list.items.filter(
      (i) =>
        (tab === "done" ? i.done : !i.done) &&
        (category === "all" || i.category === category) &&
        matches(i, query.trim()),
    );
    // Done: most recently checked off first, like the app.
    if (tab === "done")
      filtered.sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
    return filtered;
  }, [list.items, tab, category, query]);

  const filtering = query.trim() !== "" || category !== "all";

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
      <div className="min-w-0">
        <Fragment key="cover">{cover}</Fragment>

        {/* Status chips, category filter and List/Map */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-2" role="tablist" aria-label="Status">
            <button
              role="tab"
              aria-selected={tab === "todo"}
              className="chip"
              onClick={() => setTab("todo")}
            >
              To do <span className="chip-count">{todoCount}</span>
            </button>
            <button
              role="tab"
              aria-selected={tab === "done"}
              className="chip"
              onClick={() => setTab("done")}
            >
              Done <span className="chip-count">{list.done}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {usedCategories.length > 1 && (
              <label
                className={`icon-circle relative cursor-pointer ${category !== "all" ? "!bg-ink !text-surface" : ""}`}
                title="Filter by category"
              >
                <FilterIcon />
                <span className="sr-only">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  <option value="all">All categories</option>
                  {usedCategories.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORIES[c].icon} {CATEGORIES[c].label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {/* Search, and List/Map on small screens */}
        <div className="mt-4 flex gap-2">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-hairline bg-surface px-4 text-muted focus-within:border-check">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this list"
              className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-muted"
            />
          </label>
          {hasPlaces && (
            <div className="flex h-12 shrink-0 items-center rounded-full bg-surface-secondary p-[3px] font-heading text-[15px] lg:hidden">
              {(["list", "map"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`h-full rounded-full px-4 capitalize transition-colors ${
                    view === v ? "bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.12)]" : "text-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {category !== "all" && (
          <button
            onClick={() => setCategory("all")}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-secondary px-3 py-1.5 text-[15px]"
          >
            {CATEGORIES[category]?.icon} {CATEGORIES[category]?.label}
            <span className="text-muted" aria-label="Clear category">
              ✕
            </span>
          </button>
        )}

        {view === "map" ? (
          <MapPanel items={shown} className="mt-5 h-[62vh] rounded-2xl lg:hidden" />
        ) : null}

        <section className={`mt-6 ${view === "map" ? "hidden lg:block" : ""}`}>
          <h2 className="section-label px-1 pb-1">
            {tab === "todo" ? "To do" : "Done"} · {shown.length}
          </h2>
          {shown.length ? (
            <div className="-ml-1">
              {shown.map((item, i) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered((h) => (h === item.id ? null : h))}
                >
                  <ItemRow item={item} showAdder={showAdder} divider={i < shown.length - 1} />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-[17px] text-muted">
              {filtering
                ? "No matches."
                : tab === "todo"
                  ? "All done. Time for a new list."
                  : "Nothing checked off yet. Got any plans this weekend?"}
            </p>
          )}
        </section>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <Fragment key="sidebar">{sidebar}</Fragment>
          {hasPlaces && (
            <MapPanel
              items={shown}
              activeId={hovered}
              className="h-[380px] rounded-2xl border border-hairline"
            />
          )}
        </div>
      </aside>
    </div>
  );
}
