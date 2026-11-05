import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What The List keeps, who can see it, and how to remove it.",
};

const UPDATED = "November 4, 2026";

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy"
      intro="The List keeps your lists so you can share them with the people you choose. It doesn't sell your data or show you ads."
    >
      <p className="text-[15px] text-muted">Last updated {UPDATED}</p>

      <h2>What the app keeps</h2>
      <ul>
        <li>
          <strong>Your account:</strong> your name and email address, used to sign you in and to
          show your name to people on lists you share.
        </li>
        <li>
          <strong>Your lists:</strong> list names and everything on them, including addresses,
          notes, when something was checked off, reactions and reviews, and who added or checked off
          each thing.
        </li>
        <li>
          <strong>Activity:</strong> a record of what people do on a shared list (added, checked
          off, joined), shown only to the people on that list.
        </li>
      </ul>
      <p>
        This is stored with Google Firebase. Place photos and details are looked up with Apple Maps
        and Google Maps using the name and address of the place.
      </p>

      <h2>Your location</h2>
      <p>
        If you allow it, the app uses your location on your iPhone to show how far away places are
        and what&apos;s nearby. Your location isn&apos;t saved to your account or shared with anyone
        on your lists.
      </p>

      <h2>Who can see your lists</h2>
      <ul>
        <li>A list is private to you until you share it.</li>
        <li>
          People you invite, or who join from a link you send, can see the whole list. Editors can
          also change it.
        </li>
        <li>
          When a list is shared by link, anyone with the link can open it on thelistofus.com. These
          pages show first names only, never email addresses, and are kept out of search engines.
          Stop sharing the link in the app and the page goes away.
        </li>
      </ul>

      <h2>Reviews you share publicly</h2>
      <p>
        When you check something off, you can choose to share how it went with anyone looking at
        that place. If you do, your first name, rating and review can appear on thelistofus.com
        pages for the same place, including on other people&apos;s lists. It&apos;s off unless you
        turn it on, and turning it off again takes the review down.
      </p>

      <h2>Deleting your data</h2>
      <p>
        You can delete lists and anything on them in the app at any time. To delete your account,
        open your profile in the app and tap Delete account. That removes your name, email and
        sign-in, deletes the lists you made (for everyone on them), and takes you off lists other
        people made, and takes down any reviews you shared publicly. Things you added to someone
        else&apos;s list stay on it, as part of their list.
      </p>
      <p>
        If you can&apos;t get into the app, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the address you signed up with
        and your account will be deleted for you.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. If this policy changes, the
        date at the top will change with it.
      </p>
    </PageShell>
  );
}
