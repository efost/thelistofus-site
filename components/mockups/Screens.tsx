import { categoryLabel, fallbackEmoji, REACTIONS } from "@/lib/categories";
import type { Item, SharedList } from "@/lib/lists";
import { AvatarStack } from "../Avatar";
import CoverCollage from "../CoverCollage";
import ItemRow, { photoURL } from "../ItemRow";
import PlacePhoto from "../PlacePhoto";
import { StatusBar } from "./Phone";

// The app's screens redrawn in HTML for the home page, filled from the example list.

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  back: "M15 5l-7 7 7 7",
  bell: "M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2zM10 20a2 2 0 0 0 4 0",
  share: "M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7",
  plus: "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  filter: "M4 7h16M7 12h10M10 17h4",
  sort: "M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4",
  close: "M6 6l12 12M18 6L6 18",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  directions: "M12 2 2 12l10 10 10-10L12 2zM9 13v-2a1 1 0 0 1 1-1h5M13 8l2 2-2 2",
  link: "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1",
};

export { Icon };

function Circle({ d }: { d: string }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-secondary">
      <Icon d={d} />
    </span>
  );
}

export function ListScreenMock({ list }: { list: SharedList }) {
  const todo = list.items.filter((i) => !i.done);
  const candidates = list.items
    .filter((i) => i.isPlace)
    .slice(0, 8)
    .map((i) => ({ src: photoURL(i, "full")! }));
  return (
    <div className="relative h-full bg-surface">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pb-3">
        <Circle d={ICONS.back} />
        <div className="flex rounded-full bg-surface-secondary p-[3px] font-heading text-[16px]">
          <span className="rounded-full bg-surface px-5 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
            List
          </span>
          <span className="px-5 py-2 text-muted">Map</span>
        </div>
        <div className="flex gap-2">
          <Circle d={ICONS.bell} />
          <Circle d={ICONS.share} />
        </div>
      </div>
      <CoverCollage candidates={candidates} emoji={list.emoji || "📍"} className="h-[300px]">
        <div className="absolute inset-x-5 bottom-4 text-white">
          <div className="font-heading text-[32px] leading-none">{list.name}</div>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-3">
              <AvatarStack people={list.people} size={34} ring="rgba(255,255,255,0.9)" />
              <span className="font-heading text-[16px]">Invite</span>
            </span>
            <span className="flex items-center gap-2 font-heading text-[16px]">
              <span className="h-[6px] w-20 overflow-hidden rounded-full bg-white/35">
                <span
                  className="block h-full rounded-full bg-white"
                  style={{ width: `${(list.done / list.total) * 100}%` }}
                />
              </span>
              {list.done}/{list.total}
            </span>
          </div>
        </div>
      </CoverCollage>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex gap-2">
          <span className="chip" aria-pressed="true">
            To do <span className="chip-count">{todo.length}</span>
          </span>
          <span className="chip">
            Done <span className="chip-count">{list.done}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <span className="icon-circle">
            <Icon d={ICONS.filter} size={18} />
          </span>
          <span className="icon-circle">
            <Icon d={ICONS.sort} size={18} />
          </span>
        </div>
      </div>
      <div className="px-5 pb-1 section-label">To do · {todo.length}</div>
      <div className="pl-1 pr-3">
        {todo.slice(0, 5).map((item) => (
          <ItemRow key={item.id} item={item} linked={false} showAdder />
        ))}
      </div>
      {/* Floating search and + */}
      <div className="absolute inset-x-4 bottom-7 flex items-center gap-3">
        <div className="flex h-[52px] flex-1 items-center gap-2.5 rounded-full border border-hairline bg-surface px-4 text-[18px] text-muted shadow-card">
          <Icon d={ICONS.search} /> Search this list
        </div>
        <span
          className="flex h-[56px] w-[56px] items-center justify-center rounded-full text-white shadow-card"
          style={{ background: "var(--fill-gradient)" }}
        >
          <Icon d={ICONS.plus} size={26} />
        </span>
      </div>
    </div>
  );
}

export function ItemScreenMock({ item, listName }: { item: Item; listName: string }) {
  const reaction = item.reaction ? REACTIONS[item.reaction] : null;
  return (
    <div className="relative h-full bg-surface">
      <PlacePhoto
        src={photoURL(item, "full")}
        emoji={fallbackEmoji(item.category)}
        emojiSize={64}
        className="h-[330px] w-full"
        tint="linear-gradient(135deg, rgba(9,74,171,0.16), rgba(158,9,171,0.16))"
      />
      <div className="absolute inset-x-0 top-0">
        <StatusBar light />
        <div className="flex justify-between px-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-black backdrop-blur">
            <Icon d={ICONS.close} size={18} />
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-black backdrop-blur">
            <Icon d={ICONS.more} size={22} />
          </span>
        </div>
      </div>
      <div className="space-y-6 p-5">
        <div>
          <div className="font-heading text-[28px] leading-tight">{item.name}</div>
          <div className="mt-1 text-[17px] text-muted">
            {[categoryLabel(item.category), item.city, listName].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="space-y-2">
          <div className="section-label">How it went</div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-secondary text-[22px]">
              {reaction?.emoji ?? "✓"}
            </span>
            <div className="flex-1">
              <div className="font-heading text-[18px]">{reaction?.label ?? "Done"}</div>
              <div className="text-[16px] text-muted">
                Checked off by {item.completedBy?.name ?? "you"}
              </div>
            </div>
            <span className="font-heading text-[15px] text-link">Edit</span>
          </div>
          {item.review && (
            <div className="flex gap-2.5 pt-1">
              <span className="w-[3px] shrink-0 rounded-full bg-hairline" />
              <p className="text-[17px]">{item.review}</p>
            </div>
          )}
        </div>
        {item.notes && (
          <div className="space-y-2">
            <div className="section-label">Notes</div>
            <p className="text-[16px]">{item.notes}</p>
          </div>
        )}
        <div className="space-y-3">
          <div className="section-label">Location</div>
          <p className="text-[16px]">{[item.address, item.city].filter(Boolean).join(", ")}</p>
          <div className="flex gap-2">
            <span className="btn-outline">
              <Icon d={ICONS.map} size={17} /> Open in Maps
            </span>
            <span className="btn-outline">
              <Icon d={ICONS.directions} size={17} /> Directions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
