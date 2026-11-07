import Link from "next/link";
import GetAppButton from "@/components/GetAppButton";
import HeroHeadline from "@/components/HeroHeadline";
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
import Waitlist from "@/components/Waitlist";
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
          {/* Soft wash, strongest under the phones so they sit on something. */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(42% 55% at 78% 62%, color-mix(in srgb, var(--brand-blue) 14%, transparent), transparent 70%), radial-gradient(40% 50% at 92% 18%, color-mix(in srgb, var(--brand-purple) 12%, transparent), transparent 70%)",
            }}
          />
          <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 pt-10 md:pt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-4 lg:pt-16">
            <div className="max-w-xl lg:pt-3">
              <HeroHeadline className="text-[32px] leading-[1.06] tracking-[-0.035em] sm:text-[52px] lg:text-[58px]" />
              <p className="mt-5 max-w-lg text-[19px] leading-relaxed text-muted sm:text-[20px]">
                Restaurants, bars, hikes and everything you&apos;ve been meaning to try, shared with
                the people you&apos;ll go with.
              </p>
              <div className="mt-8">
                {IS_ON_APP_STORE || !TURNSTILE_SITE_KEY ? (
                  <GetAppButton size="lg" />
                ) : (
                  <Waitlist
                    siteKey={TURNSTILE_SITE_KEY}
                    where="hero"
                    align="start"
                    aside={
                      <Link
                        href={`/list/${SAMPLE_LIST_ID}`}
                        data-umami-event="example-list"
                        className="group inline-flex items-center gap-1 font-heading text-[14px] text-link"
                      >
                        See a list in action
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </Link>
                    }
                  />
                )}
              </div>
              {(IS_ON_APP_STORE || !TURNSTILE_SITE_KEY) && (
                <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-muted">
                  {!IS_ON_APP_STORE && <span>For iPhone. Coming soon to the App Store.</span>}
                  <Link
                    href={`/list/${SAMPLE_LIST_ID}`}
                    data-umami-event="example-list"
                    className="group inline-flex items-center gap-1 font-heading text-link"
                  >
                    See a list in action
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </p>
              )}
            </div>

            {/* The phones share a top line with the headline and run off the bottom of the
                hero, so the section ends on a clean edge rather than empty space. */}
            <div className="relative mx-auto h-[520px] w-full max-w-[520px] sm:h-[560px] lg:mt-0 lg:h-[500px]">
              <div className="absolute left-1/2 top-0 w-[520px] origin-top -translate-x-1/2 scale-[0.78] sm:scale-[0.86] lg:left-0 lg:translate-x-0 lg:scale-[0.76] xl:scale-[0.9]">
                {/* Ground shadow: one long pool under the cluster instead of a halo on each phone. */}
                <div
                  className="absolute left-[40px] top-[560px] h-[90px] w-[460px] rounded-[50%] blur-2xl"
                  style={{ background: "rgba(20, 20, 60, 0.22)" }}
                  aria-hidden
                />
                <Phone
                  width={290}
                  className="absolute left-[235px] top-14 hidden rotate-[6deg] sm:block"
                  label="An item in The List: Little Ember Café, loved, with a review"
                  shadow="none"
                >
                  <ItemScreenMock item={ember} listName={list.name} />
                </Phone>
                <Phone
                  width={290}
                  className="absolute left-[115px] top-0 sm:left-[10px] sm:-rotate-[3deg]"
                  label="A shared list in The List, with photos and progress"
                  shadow="soft"
                >
                  <ListScreenMock list={list} />
                </Phone>
              </div>
            </div>
          </div>
          {/* The phones fade out at the bottom edge instead of stopping dead. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
            style={{ background: "linear-gradient(to bottom, transparent, var(--surface))" }}
            aria-hidden
          />
        </section>

        <Feature
          title="Add it the second you hear about it"
          body="Type a name and the address, photo and map pin fill themselves in. Movies, shows and weekend trips go on just as easily, or paste a whole list straight out of Notes."
          visual={
            <AddPlaceCard
              items={[byId("pells-bakery"), byId("foghorn-creamery"), byId("lucky-hound")]}
            />
          }
        />
        <Feature
          flip
          title="Share it with your people"
          body="Send a link and your friends are in. They add their finds, you add yours, and everyone sees the whole list, with a bell for what's new since you last looked. You decide who can edit and who's just browsing."
          visual={<ShareCard list={list} />}
        />
        <Feature
          title="Check it off. Leave a review."
          body="Just got back? Check it off, pick 👎 😐 👍 or ❤️, and leave a review for whoever's next. Everyone sees it, so the best spots rise to the top."
          visual={<ReactionCard item={ember} />}
        />

        {/* Shared links */}
        <section className="px-5 py-10 md:py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 rounded-[32px] bg-surface-secondary px-6 py-12 md:grid-cols-2 md:px-14 md:py-16">
            <div>
              <h2 className="text-[34px] leading-[1.08] tracking-[-0.02em] md:text-[44px]">
                Links that look good in the group chat
              </h2>
              <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted">
                Every list, and every place on it, has its own page. Drop one in Messages and it
                shows up as a proper card, photos and all. Friends without the app can browse it
                right away and join when they&apos;re ready.
              </p>
              <Link
                href={`/list/${SAMPLE_LIST_ID}`}
                data-umami-event="example-list"
                className="btn-pill mt-7 !min-h-12 !bg-surface !px-5 !text-[16px]"
              >
                Open the example →
              </Link>
            </div>
            <div className="flex justify-center md:justify-end">
              <MessagesCard list={list} previewSrc={`/list/${SAMPLE_LIST_ID}/opengraph-image`} />
            </div>
          </div>
        </section>

        {/* Get the app */}
        <section id="get-the-app" className="scroll-mt-20 px-5 pb-24 pt-6 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-[38px] leading-[1.05] tracking-[-0.02em] md:text-[52px]">
              {IS_ON_APP_STORE ? "Start your list" : "Be first in line"}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[18px] text-muted">
              A list for date nights, a list for the trip, a list for the whole group chat.
            </p>
            <div className="mt-8">
              {IS_ON_APP_STORE ? (
                <div className="flex flex-col items-center gap-3">
                  <GetAppButton size="lg" />
                  <span className="text-[15px] text-muted">For iPhone.</span>
                </div>
              ) : TURNSTILE_SITE_KEY ? (
                <Waitlist siteKey={TURNSTILE_SITE_KEY} where="footer" />
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
    <section className="px-5 py-8 md:py-10">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-14 ${
          flip ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="max-w-md md:px-6">
          <h2 className="text-[32px] leading-[1.08] tracking-[-0.02em] md:text-[42px]">{title}</h2>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{body}</p>
        </div>
        {/* The mockup sits on the same wash as the hero, so it doesn't float on white. */}
        <div
          className="flex min-w-0 justify-center rounded-[28px] px-4 py-8 md:rounded-[32px] md:px-10 md:py-14"
          style={{
            background:
              "radial-gradient(70% 80% at 80% 15%, color-mix(in srgb, var(--brand-purple) 11%, transparent), transparent 70%), radial-gradient(70% 80% at 15% 90%, color-mix(in srgb, var(--brand-blue) 11%, transparent), transparent 70%), var(--surface-secondary)",
          }}
        >
          {visual}
        </div>
      </div>
    </section>
  );
}
