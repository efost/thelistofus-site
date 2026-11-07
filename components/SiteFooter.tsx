import { SITE_NAME } from "@/lib/site";
import Link from "next/link";
import AppIcon from "./AppIcon";

export default function SiteFooter({
  photoCredit = false,
  joinBar = false,
}: {
  photoCredit?: boolean;
  /** The page has a JoinBar pinned below on phones; leave room for it inside the wash. */
  joinBar?: boolean;
}) {
  return (
    // The same wash as the hero, so the page opens and closes on it. Sized in pixels rather
    // than percentages, so the glows keep their shape on a short footer.
    <footer
      className={joinBar ? "pb-24 lg:pb-0" : undefined}
      style={{
        background:
          "radial-gradient(min(560px, 70vw) 420px at 88% 10%, color-mix(in srgb, var(--brand-purple) 20%, transparent), transparent 70%), radial-gradient(min(520px, 65vw) 400px at 64% 110%, color-mix(in srgb, var(--brand-blue) 20%, transparent), transparent 70%), var(--surface-secondary)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <AppIcon size={28} />
            <span className="font-heading text-[17px]">{SITE_NAME}</span>
          </Link>
        </div>
        <nav
          className="flex flex-wrap gap-x-7 gap-y-3 font-heading text-[15px]"
          aria-label="Footer"
        >
          <Link href="/support" className="text-muted hover:text-ink">
            Support
          </Link>
          <Link href="/privacy" className="text-muted hover:text-ink">
            Privacy
          </Link>
        </nav>
      </div>
      {photoCredit && (
        <div className="mx-auto -mt-4 max-w-6xl px-5 pb-10 text-[13px] text-muted">
          Place photos from Google Maps. Maps from Apple.
        </div>
      )}
    </footer>
  );
}
