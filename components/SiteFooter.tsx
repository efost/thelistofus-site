import Link from "next/link";
import { SITE_NAME, TAGLINE } from "@/lib/site";
import AppIcon from "./AppIcon";

export default function SiteFooter({ photoCredit = false }: { photoCredit?: boolean }) {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <AppIcon size={28} />
            <span className="font-heading text-[17px]">{SITE_NAME}</span>
          </Link>
          <p className="mt-3 text-[15px] text-muted">{TAGLINE}</p>
        </div>
        <nav
          className="flex flex-wrap gap-x-7 gap-y-3 font-heading text-[15px]"
          aria-label="Footer"
        >
          <Link href="/list/example" className="text-muted hover:text-ink">
            Example list
          </Link>
          <Link href="/support" className="text-muted hover:text-ink">
            Support
          </Link>
          <Link href="/privacy" className="text-muted hover:text-ink">
            Privacy
          </Link>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 pb-10 text-[13px] text-muted sm:flex-row sm:justify-between">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}. iPhone only, for now.
        </span>
        {photoCredit && <span>Place photos from Google Maps. Maps from Apple.</span>}
      </div>
    </footer>
  );
}
