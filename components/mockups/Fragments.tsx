import { fallbackEmoji, REACTIONS } from "@/lib/categories";
import type { Item, SharedList } from "@/lib/lists";
import { Avatar } from "../Avatar";
import { photoURL } from "../ItemRow";
import PlacePhoto from "../PlacePhoto";
import { Icon, ICONS } from "./Screens";

// Small pieces of the app's UI, shown floating beside each feature on the home page.

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-hairline bg-surface shadow-float ${className}`}>
      {children}
    </div>
  );
}

/** "Add places": a search with results, each ready to add. */
export function AddPlaceCard({ items }: { items: Item[] }) {
  return (
    <Card className="w-full max-w-[400px] overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <span className="btn-pill !min-h-9 !text-[14px]">Cancel</span>
        <span className="font-heading text-[18px]">Add places</span>
        <span
          className="btn-pill !min-h-9 !text-[14px] !text-white"
          style={{ background: "var(--fill-gradient)" }}
        >
          Done
        </span>
      </div>
      <div className="px-5 pb-3">
        <div className="flex h-11 items-center gap-2 rounded-lg bg-surface-secondary px-3 text-[17px]">
          <Icon d={ICONS.search} size={18} />
          <span>mission</span>
          <span className="h-5 w-[2px] animate-pulse bg-check" />
        </div>
      </div>
      <div className="px-5 pb-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-hairline" : ""}`}
          >
            <PlacePhoto
              src={photoURL(item, "thumb")}
              emoji={fallbackEmoji(item.category)}
              className="h-11 w-11 shrink-0 rounded-md"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-heading text-[16px]">{item.name}</div>
              <div className="truncate text-[14px] text-muted">
                {item.address} · {item.city}
              </div>
            </div>
            {i === 0 ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-check text-white">
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.3 5 8.7l4.6-5.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary">
                <Icon d={ICONS.plus} size={16} />
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/** The share sheet: link, people and what they can do. */
export function ShareCard({ list }: { list: SharedList }) {
  const roles = ["Owner", "Can edit", "Can view"];
  return (
    <Card className="w-full max-w-[400px] p-5">
      <div className="text-center font-heading text-[18px]">Share “{list.name}”</div>
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-secondary p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-link">
          <Icon d={ICONS.link} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[15px]">Anyone with the link</div>
          <div className="truncate text-[14px] text-muted">thelistofus.com/list/…</div>
        </div>
        <span className="btn-pill !min-h-8 !bg-surface !px-3 !text-[14px]">Copy</span>
      </div>
      <div className="mt-4 section-label">People</div>
      <div className="mt-1">
        {list.people.slice(0, 3).map((p, i) => (
          <div
            key={p.name}
            className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-hairline" : ""}`}
          >
            <Avatar person={p} size={34} ring="none" />
            <span className="flex-1 font-heading text-[16px]">{p.name}</span>
            <span className="text-[15px] text-muted">{roles[i] ?? "Can edit"}</span>
          </div>
        ))}
      </div>
      <div className="btn-primary mt-3 w-full !min-h-11 !text-[16px]">Invite people</div>
    </Card>
  );
}

export function ReactionCard({ item }: { item: Item }) {
  return (
    <Card className="w-full max-w-[400px] p-5">
      <div className="font-heading text-[18px]">How was it?</div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {Object.entries(REACTIONS).map(([key, r]) => {
          const selected = key === item.reaction;
          return (
            <div
              key={key}
              className="flex h-[76px] flex-col items-center justify-center gap-1.5 rounded-xl border"
              style={{
                borderColor: selected ? "var(--brand-blue)" : "var(--hairline)",
                borderWidth: selected ? 2 : 1,
                background: selected
                  ? "color-mix(in srgb, var(--brand-blue) 10%, transparent)"
                  : undefined,
              }}
            >
              <span className="text-[24px] leading-none">{r.emoji}</span>
              <span className="text-[12px]">{r.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 font-heading text-[18px]">What did you think?</div>
      <div className="mt-2 rounded-lg bg-surface-secondary p-3 text-[16px]">{item.review}</div>
      <div className="mt-3 text-center text-[14px] text-muted">
        Everyone on this list will see how it went.
      </div>
    </Card>
  );
}

/** A Messages thread with a shared list's link preview. */
export function MessagesCard({ list, previewSrc }: { list: SharedList; previewSrc: string }) {
  return (
    <div className="w-full max-w-[420px] rounded-[28px] border border-hairline bg-surface p-4 shadow-float">
      <div className="mb-3 text-center text-[12px] text-muted">iMessage · Today 6:12 PM</div>
      <div
        className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md px-4 py-2 text-[16px] text-white"
        style={{ background: "#0a84ff" }}
      >
        Added a few for Saturday
      </div>
      <div className="ml-auto mt-1.5 w-[82%] overflow-hidden rounded-[20px] rounded-br-md bg-surface-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewSrc}
          alt={`Link preview for ${list.name}`}
          className="aspect-[1200/630] w-full object-cover"
        />
        <div className="px-3.5 py-2.5">
          <div className="font-heading text-[15px] leading-tight">{list.name}</div>
          <div className="text-[13px] text-muted">thelistofus.com</div>
        </div>
      </div>
      <div className="mt-3 w-fit max-w-[80%] rounded-[20px] rounded-bl-md bg-surface-secondary px-4 py-2 text-[16px]">
        Driftwood first, then Little Ember?
      </div>
    </div>
  );
}
