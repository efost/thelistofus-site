import Link from "next/link";
import { fallbackEmoji, REACTIONS } from "@/lib/categories";
import type { Item } from "@/lib/lists";
import { itemPath } from "@/lib/site";
import { Avatar } from "./Avatar";
import PlacePhoto from "./PlacePhoto";
import When from "./When";

export function photoURL(item: Pick<Item, "listId" | "id" | "isPlace">, size: "thumb" | "full") {
  return item.isPlace
    ? `/api/photo/${encodeURIComponent(item.listId)}/${encodeURIComponent(item.id)}?size=${size}`
    : null;
}

export function CheckCircle({ done, size = 24 }: { done: boolean; size?: number }) {
  return done ? (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-check text-white"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 12 12" fill="none" aria-hidden>
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
    <span
      className="inline-block shrink-0 rounded-full border-2 border-[#8e8e93] opacity-60"
      style={{ width: size, height: size }}
    />
  );
}

/** One item, laid out like the app's list rows: check, photo, name and a meta line. */
export default function ItemRow({
  item,
  showAdder = true,
  divider = true,
  linked = true,
}: {
  item: Item;
  showAdder?: boolean;
  divider?: boolean;
  linked?: boolean;
}) {
  const reaction = item.reaction ? REACTIONS[item.reaction] : null;
  const meta = item.done ? (
    <>
      Done
      {item.completedAt && (
        <>
          {" "}
          <When iso={item.completedAt} />
        </>
      )}
      {reaction && (
        <>
          {" "}
          · {reaction.emoji} {reaction.label}
        </>
      )}
    </>
  ) : (
    [item.city, item.city ? null : item.category !== "None" ? item.category : null]
      .filter(Boolean)
      .join(" · ")
  );

  const body = (
    <>
      <span className="flex w-11 shrink-0 justify-center">
        <CheckCircle done={item.done} />
      </span>
      <PlacePhoto
        src={photoURL(item, "thumb")}
        emoji={fallbackEmoji(item.category)}
        className={`h-12 w-12 shrink-0 rounded-md ${item.done ? "opacity-55" : ""}`}
      />
      <span
        className={`relative flex min-w-0 flex-1 items-center gap-3 self-stretch py-2.5 ${
          divider
            ? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:scale-y-50 after:bg-hairline"
            : ""
        }`}
      >
        <span className={`min-w-0 flex-1 ${item.done ? "opacity-60" : ""}`}>
          <span className="block truncate font-heading text-[18px] leading-tight">{item.name}</span>
          {meta && <span className="mt-0.5 block truncate text-[16px] text-muted">{meta}</span>}
        </span>
        {showAdder && item.addedBy && (
          <span className="pr-1" title={`Added by ${item.addedBy.name}`}>
            <Avatar person={item.addedBy} size={22} ring="none" />
          </span>
        )}
      </span>
    </>
  );

  const rowClass = "group flex items-center gap-3 rounded-xl pr-2 transition-colors";
  return linked ? (
    <Link
      href={itemPath(item.listId, item.id)}
      className={`${rowClass} hover:bg-surface-secondary/70`}
    >
      {body}
    </Link>
  ) : (
    <div className={rowClass}>{body}</div>
  );
}
