import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-20 text-center">
        <span className="text-[56px]" aria-hidden>
          📍
        </span>
        <h1 className="mt-4 text-[32px] leading-tight">Nothing here</h1>
        <p className="mt-3 text-[17px] text-muted">
          That page doesn’t exist. If a friend sent you a list, it may have gone private. Ask
          them for a new link.
        </p>
        <Link href="/" className="btn-pill mt-8">
          Go to the home page
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
