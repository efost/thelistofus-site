import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Help with The List: sharing lists, joining from a link, and getting in touch.",
};

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I share a list?",
    a: (
      <>
        Open the list and tap the share button at the top. Turn on the link and send it however you
        like. Choose whether people who join can edit the list or only look at it.
      </>
    ),
  },
  {
    q: "Someone sent me a link. How do I join?",
    a: (
      <>
        With the app installed, tapping the link opens the list in the app, where you can join it.
        Without the app you&apos;ll see the list on this website. Install the app, then tap the link
        again.
      </>
    ),
  },
  {
    q: "Can I share a single place?",
    a: (
      <>
        Yes. Open the place and choose Share from the menu. On a shared list, the link opens a page
        for that place with its photo, notes and how it went.
      </>
    ),
  },
  {
    q: "Where do the photos come from?",
    a: (
      <>
        Places you add are matched with Apple Maps and Google Maps, and the first photo of the place
        is used. Movies, shows and other things without a place get their category&apos;s icon
        instead.
      </>
    ),
  },
  {
    q: "How do I stop sharing a list?",
    a: (
      <>
        Open the list, tap share and turn off the link. People already on the list stay on it until
        you remove them; the web page for the list stops working straight away.
      </>
    ),
  },
  {
    q: "Is there an Android app?",
    a: <>Not yet. The List is iPhone only for now.</>,
  },
];

export default function SupportPage() {
  return (
    <PageShell title="Support" intro="Answers to common questions, and how to reach a person.">
      <div className="mt-2 divide-y divide-hairline border-y border-hairline">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-[18px]">
              {q}
              <span className="text-muted transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-2 !mb-0 text-muted">{a}</p>
          </details>
        ))}
      </div>

      <h2>Still stuck?</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with what happened and, if you
        can, a screenshot. See the <Link href="/privacy">privacy policy</Link> for how your data is
        handled.
      </p>
    </PageShell>
  );
}
