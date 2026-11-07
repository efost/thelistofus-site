import Link from "next/link";
import GetAppButton from "@/components/GetAppButton";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function ListNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-20 text-center">
        <span className="text-[56px]" aria-hidden>
          📍
        </span>
        <h1 className="mt-4 text-[32px] leading-tight">This list isn&apos;t shared</h1>
        <p className="mt-3 text-[17px] text-muted">
          It may have been made private, or the link is incomplete. Ask whoever sent it to share it
          again from the app.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <GetAppButton label="Make your own list" preLaunchLabel="Make your own list" />
          <Link href="/" className="font-heading text-[15px] text-link">
            What is The List?
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
