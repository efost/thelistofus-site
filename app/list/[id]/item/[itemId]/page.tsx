import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import ItemMap from "@/components/ItemMap";
import { CheckCircle, photoURL } from "@/components/ItemRow";
import { JoinBar } from "@/components/JoinPrompt";
import AppIcon from "@/components/AppIcon";
import GetAppButton from "@/components/GetAppButton";
import PlacePhoto from "@/components/PlacePhoto";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import When from "@/components/When";
import { categoryLabel, fallbackEmoji, REACTIONS } from "@/lib/categories";
import { getSharedItem, type Item } from "@/lib/lists";
import { getOtherReviews, type PublicReview } from "@/lib/reviews";
import { SAMPLE_LIST_ID } from "@/lib/sample";
import { APP_STORE_ID, appURL, IS_ON_APP_STORE, itemPath, listPath, SITE_URL } from "@/lib/site";

export const revalidate = 60;

// Built the first time someone opens them, then cached (see revalidate).
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ id: string; itemId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, itemId } = await params;
  const found = await getSharedItem(id, itemId);
  if (!found) return { title: "Not found", robots: { index: false } };
  const { list, item } = found;
  const reaction = item.reaction ? REACTIONS[item.reaction] : null;
  const description =
    (reaction && item.review ? `${reaction.emoji} “${item.review}”` : item.review || item.notes) ||
    [categoryLabel(item.category), item.city, `on ${list.name}`].filter(Boolean).join(" · ");
  const url = `${SITE_URL}${itemPath(id, itemId)}`;
  return {
    title: `${item.name} · ${list.name}`,
    description,
    alternates: { canonical: url },
    openGraph: { title: item.name, description, url, type: "website" },
    twitter: { card: "summary_large_image", title: item.name, description },
    robots: id === SAMPLE_LIST_ID ? undefined : { index: false, follow: false },
    ...(APP_STORE_ID ? { itunes: { appId: APP_STORE_ID, appArgument: url } } : {}),
  };
}

/** Apple Maps links: the place itself when the app saved its Apple Maps id, else a search there. */
function mapsLinks(item: Item) {
  const query = [item.name, item.address, item.city].filter(Boolean).join(", ");
  const appleId = item.placeId?.trim();
  const isAppleId = Boolean(appleId) && !/^(ChIJ|GhIJ)/.test(appleId!);
  let apple: URL;
  if (isAppleId) {
    apple = new URL("https://maps.apple.com/place");
    apple.searchParams.set("place-id", appleId!);
  } else {
    apple = new URL("https://maps.apple.com/");
    apple.searchParams.set("q", item.name);
    if (item.lat !== null) apple.searchParams.set("ll", `${item.lat},${item.long}`);
    else apple.searchParams.set("address", query);
  }
  const directions = new URL("https://maps.apple.com/");
  directions.searchParams.set("daddr", item.lat !== null ? `${item.lat},${item.long}` : query);
  return { apple: apple.toString(), directions: directions.toString() };
}

/** A list's name in running text: the heading face, in ink, like the app's titles. */
function ListName({ children }: { children: React.ReactNode }) {
  return <span className="font-heading text-ink">{children}</span>;
}

/** "What others thought": reviews of the same place that people chose to share. */
function OtherReviews({ reviews }: { reviews: PublicReview[] }) {
  const counts = (Object.keys(REACTIONS) as (keyof typeof REACTIONS)[])
    .map((key) => ({
      key,
      n: reviews.filter((r) => r.reaction === key).length,
    }))
    .filter((c) => c.n > 0)
    .reverse();
  return (
    <Section title="What others thought">
      {counts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {counts.map(({ key, n }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-secondary px-3 py-1.5 text-[15px]"
              title={REACTIONS[key].label}
            >
              <span aria-hidden>{REACTIONS[key].emoji}</span>
              <span className="font-heading">{n}</span>
              <span className="sr-only">{REACTIONS[key].label}</span>
            </span>
          ))}
        </div>
      )}
      <ul className="divide-y divide-hairline">
        {reviews.slice(0, 6).map((r) => {
          const reaction = r.reaction ? REACTIONS[r.reaction] : null;
          return (
            <li key={r.id} className="flex gap-3 py-3.5">
              {r.author ? (
                <Avatar person={r.author} size={32} ring="none" />
              ) : (
                <span className="h-8 w-8 shrink-0 rounded-full bg-surface-secondary" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[16px]">
                  <span className="font-heading">{r.author?.name ?? "Someone"}</span>
                  {reaction && (
                    <span>
                      {" "}
                      · {reaction.emoji} {reaction.label}
                    </span>
                  )}
                  {r.completedAt && (
                    <span className="text-muted">
                      {" "}
                      · <When iso={r.completedAt} />
                    </span>
                  )}
                </div>
                {r.review && <p className="mt-1 text-[17px] leading-relaxed">{r.review}</p>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[14px] text-muted">
        From people who have this place on their own lists and chose to share their reviews.
      </p>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="section-label">{title}</h2>
      {children}
    </section>
  );
}

const icon = {
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  directions: "M12 2 2 12l10 10 10-10L12 2zM9 13v-2a1 1 0 0 1 1-1h5M13 8l2 2-2 2",
};
function Glyph({ d }: { d: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export default async function ItemPage({ params }: Props) {
  const { id, itemId } = await params;
  const found = await getSharedItem(id, itemId);
  if (!found) notFound();
  const { list, item } = found;

  const reaction = item.reaction ? REACTIONS[item.reaction] : null;
  // The example list stays self-contained; real places pick up shared reviews.
  const others = id === SAMPLE_LIST_ID ? [] : await getOtherReviews(item);
  const hasLocation = Boolean(item.address || item.city || item.lat !== null);
  const links = hasLocation ? mapsLinks(item) : null;
  // The example's restaurants are made up, so there's nothing to open in Maps.
  const showMapsLinks = id !== SAMPLE_LIST_ID;
  const more = list.items
    .filter((i) => i.id !== item.id)
    // Same kind of thing first, then still-to-do places.
    .sort(
      (a, b) =>
        Number(b.category === item.category) - Number(a.category === item.category) ||
        Number(a.done) - Number(b.done) ||
        Number(b.isPlace) - Number(a.isPlace),
    )
    .slice(0, 6);

  return (
    <>
      <SiteHeader cta={false} />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-4 sm:pt-6">
        <Link
          href={listPath(id)}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface-secondary py-1.5 pl-2 pr-4 font-heading text-[15px] transition-opacity hover:opacity-80"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {list.emoji && <span aria-hidden>{list.emoji}</span>}
          {list.name}
        </Link>

        <PlacePhoto
          src={photoURL(item, "full")}
          emoji={fallbackEmoji(item.category)}
          emojiSize={88}
          eager
          credit
          className="-mx-5 h-[260px] sm:mx-0 sm:h-[400px] sm:rounded-2xl"
          tint="linear-gradient(135deg, color-mix(in srgb, var(--brand-blue) 16%, transparent), color-mix(in srgb, var(--brand-purple) 16%, transparent))"
        />

        <div className="mt-6 space-y-8">
          <header>
            <h1 className="text-[34px] leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
              {item.name}
            </h1>
            <p className="mt-2 text-[17px] text-muted">
              {[categoryLabel(item.category), item.city].filter(Boolean).join(" · ")}
              {(item.category !== "None" || item.city) && " · "}
              on{" "}
              <Link
                href={listPath(id)}
                className="font-heading text-ink underline decoration-hairline underline-offset-4 hover:decoration-current"
              >
                {list.name}
              </Link>
            </p>
          </header>

          {item.done ? (
            <Section title="How it went">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-[24px]">
                  {reaction ? reaction.emoji : <CheckCircle done size={26} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-[19px] leading-tight">
                    {reaction?.label ?? "Done"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[16px] text-muted">
                    <span>
                      Checked off
                      {item.completedAt && (
                        <>
                          {" "}
                          <When iso={item.completedAt} style="sentence" />
                        </>
                      )}
                      {item.completedBy && <> by</>}
                    </span>
                    {item.completedBy && (
                      <>
                        <Avatar person={item.completedBy} size={20} ring="none" />
                        <span>{item.completedBy.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {item.review && (
                <blockquote className="flex gap-3 pt-1">
                  <span className="w-[3px] shrink-0 rounded-full bg-hairline" aria-hidden />
                  <p className="text-[18px] leading-relaxed">{item.review}</p>
                </blockquote>
              )}
            </Section>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary px-4 py-3.5">
              <CheckCircle done={false} />
              <p className="text-[16px]">
                Still on the to-do list.{" "}
                <span className="text-muted">
                  Been already? Check it off in the app and leave a review.
                </span>
              </p>
            </div>
          )}

          {others.length > 0 && <OtherReviews reviews={others} />}

          {item.notes && (
            <Section title="Notes">
              <p className="whitespace-pre-line text-[17px] leading-relaxed">{item.notes}</p>
            </Section>
          )}

          {links && (
            <Section title="Location">
              {(item.address || item.city) && (
                <p className="text-[17px]">
                  {[item.address, item.city].filter(Boolean).join(", ")}
                </p>
              )}
              {item.lat !== null && (
                <ItemMap item={item} className="mt-3 h-56 rounded-2xl border border-hairline" />
              )}
              {showMapsLinks && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={links.apple}
                    className="btn-outline"
                    target="_blank"
                    rel="noopener"
                    data-umami-event="open-in-maps"
                  >
                    <Glyph d={icon.map} /> Open in Maps
                  </a>
                  <a
                    href={links.directions}
                    className="btn-outline"
                    target="_blank"
                    rel="noopener"
                    data-umami-event="directions"
                  >
                    <Glyph d={icon.directions} /> Directions
                  </a>
                </div>
              )}
            </Section>
          )}

          {(item.addedBy || item.createdAt) && (
            <p className="flex items-center gap-2 text-[16px] text-muted">
              {item.addedBy && <Avatar person={item.addedBy} size={22} ring="none" />}
              {item.addedBy ? `Added by ${item.addedBy.name}` : "Added"}
              {item.createdAt && (
                <>
                  {item.addedBy && " · "}
                  <When iso={item.createdAt} style="full" />
                </>
              )}
            </p>
          )}

          {/* Get the app */}
          <div className="flex flex-col gap-4 rounded-2xl border border-hairline p-5 sm:flex-row sm:items-center">
            <AppIcon size={52} />
            <div className="flex-1">
              <div className="font-heading text-[18px] leading-tight">Want to go too?</div>
              <p className="mt-1 text-[15px] text-muted">
                Join <ListName>{list.name}</ListName> to add your own finds, and check this one
                off when you go.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <GetAppButton />
              {IS_ON_APP_STORE && (
                <a
                  href={appURL(id, item.id)}
                  className="text-center font-heading text-[14px] text-link hover:underline"
                >
                  Open in the app
                </a>
              )}
            </div>
          </div>

          {more.length > 0 && (
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-[22px]">More on {list.name}</h2>
                <Link href={listPath(id)} className="font-heading text-[15px] text-link">
                  See all {list.total}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
                {more.map((other) => (
                  <Link key={other.id} href={itemPath(id, other.id)} className="group">
                    <PlacePhoto
                      src={photoURL(other, "thumb")}
                      emoji={fallbackEmoji(other.category)}
                      emojiSize={34}
                      className={`aspect-[4/3] rounded-xl transition-transform duration-200 group-hover:scale-[1.02] ${other.done ? "opacity-70" : ""}`}
                    />
                    <div className="mt-2 flex items-start gap-1.5">
                      {other.done && (
                        <span className="mt-1">
                          <CheckCircle done size={16} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-heading text-[16px] leading-tight">
                          {other.name}
                        </div>
                        <div className="truncate text-[14px] text-muted">
                          {other.done && other.reaction
                            ? `${REACTIONS[other.reaction].emoji} ${REACTIONS[other.reaction].label}`
                            : other.city || (other.category !== "None" ? other.category : "")}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter photoCredit={id !== SAMPLE_LIST_ID} joinBar />
      <JoinBar listId={id} itemId={item.id} label="Get the app" />
    </>
  );
}
