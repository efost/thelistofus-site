import Link from "next/link";
import BetaInvite from "@/components/BetaInvite";
import GetAppButton from "@/components/GetAppButton";
import {
  AddPlaceCard,
  MessagesCard,
  ReactionCard,
  ShareCard,
} from "@/components/mockups/Fragments";
import Phone from "@/components/mockups/Phone";
import { ItemScreenMock, ListScreenMock } from "@/components/mockups/Screens";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { CATEGORIES } from "@/lib/categories";
import { SAMPLE_LIST_ID, sampleList } from "@/lib/sample";
import { IS_ON_APP_STORE, TURNSTILE_SITE_KEY } from "@/lib/site";

export default function Home() {
  const list = sampleList();
  const byId = (id: string) => list.items.find((i) => i.id === id)!;
  const ember = byId("little-ember");

  return (
    <>
      <SiteHeader showExample />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(50% 60% at 85% 30%, color-mix(in srgb, var(--brand-purple) 13%, transparent), transparent 70%), radial-gradient(45% 55% at 60% 85%, color-mix(in srgb, var(--brand-blue) 12%, transparent), transparent 70%)",
            }}
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-24">
            <div className="max-w-xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 font-heading text-[14px] text-muted">
                <span className="h-2 w-2 rounded-full bg-check" /> For iPhone
              </p>
              <h1 className="text-[44px] leading-[1.02] tracking-[-0.025em] sm:text-[60px] lg:text-[68px]">
                All the places you keep meaning to go.
              </h1>
              <p className="mt-6 max-w-lg text-[19px] leading-relaxed text-muted sm:text-[20px]">
                The List keeps the restaurants, bars, hikes, trips and shows you want to try, each
                with a photo and a pin on the map, and shares them with the people you&apos;ll go
                with.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <GetAppButton size="lg" />
                <Link
                  href={`/list/${SAMPLE_LIST_ID}`}
                  data-umami-event="example-list"
                  className="group inline-flex items-center gap-1.5 font-heading text-[17px] text-link"
                >
                  See an example list
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
              {!IS_ON_APP_STORE && (
                <p className="mt-4 text-[15px] text-muted">
                  {TURNSTILE_SITE_KEY
                    ? "In beta on TestFlight. Coming soon to the App Store."
                    : "Coming soon to the App Store."}
                </p>
              )}
            </div>

            <div className="relative mx-auto h-[600px] w-full max-w-[540px] sm:h-[660px]">
              <Phone
                width={290}
                className="absolute left-[250px] top-12 hidden rotate-[5deg] sm:block"
                label="An item in The List: Little Ember Café, loved, with a review"
              >
                <ItemScreenMock item={ember} listName={list.name} />
              </Phone>
              <Phone
                width={290}
                className="absolute left-[calc(50%-145px)] top-0 sm:left-[20px] sm:-rotate-[3deg]"
                label="A shared list in The List, with photos and progress"
              >
                <ListScreenMock list={list} />
              </Phone>
            </div>
          </div>
        </section>

        {/* What goes on a list */}
        <section
          aria-label="What you can keep on a list"
          className="border-y border-hairline bg-surface-secondary/50"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 px-5 py-6">
            {Object.values(CATEGORIES).map((c) => (
              <span key={c.label} className="chip !h-9 !bg-surface !pr-4 !text-[15px]">
                {c.icon} {c.label}
              </span>
            ))}
          </div>
        </section>

        <Feature
          title="Add anything, in seconds"
          body="Search for a place and it arrives with its address, a photo and a pin on the map. A movie, a show or a weekend away goes on just as easily, and you can paste a whole list from Notes."
          visual={
            <AddPlaceCard
              items={[byId("pells-bakery"), byId("foghorn-creamery"), byId("lucky-hound")]}
            />
          }
        />
        <Feature
          flip
          title="Share it with your people"
          body="Send a link. Friends join from it, add their own finds and see everything you've saved, and the bell shows what's new since you last looked. You choose who can edit and who can only look."
          visual={<ShareCard list={list} />}
        />
        <Feature
          title="Check it off. Say how it went."
          body="Mark a place done, pick 👎 😐 👍 or ❤️ and leave a line for whoever goes next. Everyone on the list sees it, so the good spots rise to the top."
          visual={<ReactionCard item={ember} />}
        />

        {/* Shared links */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 rounded-[32px] bg-surface-secondary px-6 py-12 md:grid-cols-2 md:px-14 md:py-16">
            <div>
              <h2 className="text-[34px] leading-[1.08] tracking-[-0.02em] md:text-[44px]">
                Links that look good anywhere
              </h2>
              <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted">
                Every shared list and every place on it has its own page. Send one in Messages and
                it arrives with photos and progress. Friends without the app can still look through
                it, then join when they&apos;re ready.
              </p>
              <Link
                href={`/list/${SAMPLE_LIST_ID}`}
                data-umami-event="example-list"
                className="btn-pill mt-7 !min-h-12 !bg-surface !px-5 !text-[16px]"
              >
                Open the example list →
              </Link>
            </div>
            <div className="flex justify-center md:justify-end">
              <MessagesCard list={list} previewSrc={`/list/${SAMPLE_LIST_ID}/opengraph-image`} />
            </div>
          </div>
        </section>

        {/* Get the app */}
        <section id="get-the-app" className="scroll-mt-20 px-5 pb-24 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-[38px] leading-[1.05] tracking-[-0.02em] md:text-[52px]">
              Start your list
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[18px] text-muted">
              One for date nights, one for the trip, one for the whole group chat.
            </p>
            <div className="mt-8">
              {IS_ON_APP_STORE ? (
                <div className="flex flex-col items-center gap-3">
                  <GetAppButton size="lg" />
                  <span className="text-[15px] text-muted">For iPhone.</span>
                </div>
              ) : TURNSTILE_SITE_KEY ? (
                <BetaInvite siteKey={TURNSTILE_SITE_KEY} />
              ) : (
                <span className="text-[15px] text-muted">
                  Coming soon to the App Store, for iPhone.
                </span>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Feature({
  title,
  body,
  visual,
  flip = false,
}: {
  title: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="px-5 py-14 md:py-20">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16 ${
          flip ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="max-w-md">
          <h2 className="text-[32px] leading-[1.08] tracking-[-0.02em] md:text-[42px]">{title}</h2>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{body}</p>
        </div>
        <div className={`flex ${flip ? "md:justify-start" : "md:justify-end"} justify-center`}>
          {visual}
        </div>
      </div>
    </section>
  );
}
