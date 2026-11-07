import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvatarStack } from "@/components/Avatar";
import CoverCollage from "@/components/CoverCollage";
import { photoURL } from "@/components/ItemRow";
import { JoinBar, JoinCard } from "@/components/JoinPrompt";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSharedList, peopleSentence, progressPercent } from "@/lib/lists";
import { SAMPLE_LIST_ID } from "@/lib/sample";
import { APP_STORE_ID, SITE_URL, listPath } from "@/lib/site";
import ListView from "./ListView";

// Lists change as people add and check things off; re-read at most once a minute.
export const revalidate = 60;

// Pages are built the first time someone opens them, then cached (see revalidate).
export function generateStaticParams() {
  return [{ id: SAMPLE_LIST_ID }];
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const list = await getSharedList(id);
  if (!list) return { title: "List not found", robots: { index: false } };

  const people = peopleSentence(list);
  const description =
    list.description ||
    `${list.done} of ${list.total} done${people ? ` · ${people}` : ""} · A shared list on The List`;
  const url = `${SITE_URL}${listPath(id)}`;
  return {
    title: list.name,
    description,
    alternates: { canonical: url },
    openGraph: { title: list.name, description, url, type: "website" },
    twitter: { card: "summary_large_image", title: list.name, description },
    // Lists are shared by link, not published: keep them out of search results.
    robots: id === SAMPLE_LIST_ID ? undefined : { index: false, follow: false },
    ...(APP_STORE_ID ? { itunes: { appId: APP_STORE_ID, appArgument: url } } : {}),
  };
}

export default async function ListPage({ params }: Props) {
  const { id } = await params;
  const list = await getSharedList(id);
  if (!list) notFound();

  const percent = progressPercent(list);
  const people = peopleSentence(list);
  // Photos for the collage: the first places on the list, tried in order.
  const candidates = list.items
    .filter((i) => i.isPlace)
    .slice(0, 9)
    .map((i) => ({ src: photoURL(i, "full")! }));

  const cover = (
    <CoverCollage
      cover={list.hasCoverPhoto ? `/api/cover/${encodeURIComponent(id)}` : null}
      candidates={candidates}
      emoji={list.emoji || "📍"}
      className="-mx-5 h-[340px] sm:mx-0 sm:h-[380px] sm:rounded-2xl"
    >
      <div className="absolute inset-x-5 bottom-5 text-white sm:inset-x-7 sm:bottom-6">
        {id === SAMPLE_LIST_ID && (
          <span className="mb-3 inline-block rounded-full bg-white/20 px-2.5 py-1 font-heading text-[13px] backdrop-blur">
            Example list
          </span>
        )}
        <h1 className="text-[34px] leading-[1.02] tracking-[-0.02em] [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-[44px]">
          {list.name}
        </h1>
        {list.description && (
          <p className="mt-2 max-w-lg text-[17px] text-white/85">{list.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <span className="flex items-center gap-3">
            {list.people.length > 0 && (
              <AvatarStack
                people={list.people}
                extra={list.memberCount - list.people.length}
                size={34}
                ring="rgba(255,255,255,0.9)"
              />
            )}
            {people && <span className="font-heading text-[16px]">{people}</span>}
          </span>
          <span
            className="flex items-center gap-2.5 font-heading text-[16px]"
            aria-label={`${list.done} of ${list.total} done`}
          >
            <span className="h-[6px] w-24 overflow-hidden rounded-full bg-white/35">
              <span
                className="block h-full rounded-full bg-white"
                style={{ width: `${percent}%` }}
              />
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <circle cx="10" cy="10" r="10" fill="#fff" />
              <path
                d="M5.8 10.4 8.6 13l5.6-6"
                stroke="#000"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {list.done}/{list.total}
          </span>
        </div>
      </div>
    </CoverCollage>
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-16 sm:pt-6">
        <ListView
          list={list}
          cover={cover}
          sidebar={
            <JoinCard
              listId={id}
              title={`Join ${list.name}`}
              body="Add your own places, check things off and say how they went. Everyone on the list sees it."
            />
          }
        />
      </main>
      <SiteFooter photoCredit={id !== SAMPLE_LIST_ID} />
      <JoinBar listId={id} label="Get the app to join" />
    </>
  );
}
