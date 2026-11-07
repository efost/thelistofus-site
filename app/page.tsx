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
      <SiteHeader showExample overlay />
      <main>
        {/* Hero: the wash runs edge to edge and up under the header; the phones hang out of
            its bottom edge, which does the cropping. Content lines up with the sections
            below (max-w-6xl, px-5). */}
        <section
          className="relative -mt-16 overflow-hidden pt-16 lg:min-h-[min(100svh,860px)] lg:flex lg:flex-col"
          style={{
            background:
              "radial-gradient(40% 70% at 88% 18%, color-mix(in srgb, var(--brand-purple) 20%, transparent), transparent 70%), radial-gradient(38% 70% at 68% 96%, color-mix(in srgb, var(--brand-blue) 20%, transparent), transparent 70%), var(--surface-secondary)",
          }}
        >
          <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-0 pt-8 sm:pt-12 lg:grid-cols-[1fr_1fr] lg:gap-4 lg:py-12 xl:grid-cols-[1.1fr_1fr]">
            <div className="max-w-xl">
              <HeroHeadline className="text-[32px] leading-[1.06] tracking-[-0.035em] sm:text-[52px] lg:text-[46px] xl:text-[55px]" />
              <p className="mt-5 max-w-lg text-[19px] leading-relaxed text-muted sm:text-[20px]">
                Restaurants, bars, hikes and everything you’ve been meaning to try, shared with
                the people you’ll go with.
              </p>
              <div className="mt-8" data-hero-cta>
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

            {/* The phone cluster: pinned to the bottom-right on desktop and running past the
                section's bottom edge; under the text on phones, cropped the same way. */}
            <div className="relative h-[400px] w-full sm:h-[460px] lg:h-auto lg:self-stretch">
              <div className="absolute left-1/2 top-0 h-[665px] w-[520px] origin-top -translate-x-1/2 scale-[0.78] sm:scale-[0.86] lg:bottom-[-16px] lg:left-auto lg:right-[-40px] lg:top-auto lg:origin-bottom lg:translate-x-0 lg:scale-[0.84] xl:bottom-[-24px] xl:right-[-20px] xl:scale-100">
                <Phone
                  width={290}
                  className="absolute left-[235px] top-14 hidden rotate-[6deg] sm:block"
                  label="An item in The List: Little Ember Café, loved, with a review"
                  shadow="soft"
                >
                  <ItemScreenMock item={ember} listName={list.name} />
                </Phone>
                <Phone
                  width={290}
                  className="absolute left-[115px] top-0 sm:left-[10px] sm:-rotate-[3deg]"
                  label="A shared list in The List, with photos and progress"
                  shadow="float"
                >
                  <ListScreenMock list={list} />
                </Phone>
              </div>
            </div>
          </div>
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
          body="Send a link and your friends are in. They add their finds, you add yours, and everyone sees the whole list, with a bell for what’s new since you last looked. You decide who can edit and who’s just browsing."
          visual={<ShareCard list={list} />}
        />
        <Feature
          title="Check it off. Leave a review."
          body="Just got back? Check it off, pick 👎 😐 👍 or ❤️, and leave a review for whoever’s next. Everyone sees it, so the best spots rise to the top."
          visual={<ReactionCard item={ember} />}
        />

        {/* Shared links */}
        <section className="py-10 md:py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid items-center gap-12 rounded-[32px] bg-surface-secondary px-6 py-12 md:grid-cols-2 md:px-14 md:py-16 md:[&>*:first-child]:order-2">
              <div>
                <h2 className="text-[34px] leading-[1.08] tracking-[-0.02em] md:text-[44px]">
                  Links that look good in the group chat
                </h2>
                <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted">
                  Every list, and every place on it, has its own page. Drop one in Messages and it
                  shows up as a proper card, photos and all. Friends without the app can browse it
                  right away and join when they’re ready.
                </p>
                <Link
                  href={`/list/${SAMPLE_LIST_ID}`}
                  data-umami-event="example-list"
                  className="btn-pill mt-7 !min-h-12 !bg-surface !px-5 !text-[16px]"
                >
                  Open the example →
                </Link>
              </div>
              <div className="flex justify-center md:justify-start">
                <MessagesCard list={list} previewSrc={`/list/${SAMPLE_LIST_ID}/opengraph-image`} />
              </div>
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
    <section className="overflow-x-clip py-8 md:py-10">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 px-5 md:grid-cols-2 md:gap-14 ${
          flip ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className={`max-w-md ${flip ? "md:pl-6" : "md:pr-6"}`}>
          <h2 className="text-[32px] leading-[1.08] tracking-[-0.02em] md:text-[42px]">{title}</h2>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{body}</p>
        </div>
        {/* The mockup sits on the same wash as the hero, so it doesn't float on white. From
            tablet up the panel runs to the edge of the page on the side away from the text
            (--bleed is the distance from the content edge to the viewport edge), with the
            mockup staying put in its column. */}
        <div
          className={`flex min-w-0 justify-center rounded-[28px] px-4 py-8 md:rounded-[32px] md:py-14 ${
            flip
              ? "md:ml-[calc(var(--bleed)*-1)] md:rounded-l-none md:pl-[calc(var(--bleed)+2.5rem)] md:pr-10"
              : "md:mr-[calc(var(--bleed)*-1)] md:rounded-r-none md:pl-10 md:pr-[calc(var(--bleed)+2.5rem)]"
          }`}
          style={{
            ["--bleed" as string]: "calc(max(0px, (100vw - 72rem) / 2) + 1.25rem)",
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
