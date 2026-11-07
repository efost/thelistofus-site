import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import AppIcon from "./AppIcon";
import GetAppButton from "./GetAppButton";
import HeaderShade from "./HeaderShade";

/**
 * `cta` is off on pages that carry their own "join" card, so there's one call to action per
 * screen. `overlay` lays the header over the page's hero wash with no background of its
 * own until the page scrolls. On every page the header picks up its shadow once the page
 * scrolls under it.
 */
export default function SiteHeader({
  showExample = false,
  cta = true,
  overlay = false,
}: {
  showExample?: boolean;
  cta?: boolean;
  overlay?: boolean;
}) {
  return (
    <header
      className="site-header sticky top-0 z-40 bg-surface/85 backdrop-blur-xl backdrop-saturate-150"
      {...(overlay ? { "data-overlay": "" } : {})}
    >
      <HeaderShade />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
          <AppIcon size={30} />
          <span className="font-heading text-[19px] tracking-[-0.01em]">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-5">
          {showExample && (
            <Link
              href="/list/example"
              className="hidden font-heading text-[15px] text-muted transition-colors hover:text-ink sm:inline"
            >
              See it in action
            </Link>
          )}
          {cta && <GetAppButton size="sm" />}
        </nav>
      </div>
    </header>
  );
}
