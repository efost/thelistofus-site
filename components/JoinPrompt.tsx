import { APP_NAME, appURL, IS_ON_APP_STORE } from "@/lib/site";
import AppIcon from "./AppIcon";
import GetAppButton from "./GetAppButton";

/** Desktop sidebar card: what you get by joining in the app. */
export function JoinCard({
  title,
  body,
  listId,
  itemId,
}: {
  title: React.ReactNode;
  body: string;
  listId: string;
  itemId?: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline p-5">
      <div className="flex items-center gap-3">
        <AppIcon size={44} />
        <div>
          <div className="font-heading text-[17px] leading-tight">{title}</div>
          <div className="text-[14px] text-muted">{APP_NAME}</div>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
      <GetAppButton label="Get the app to join" className="mt-4 w-full" />
      {IS_ON_APP_STORE && (
        <a
          href={appURL(listId, itemId)}
          data-umami-event="open-in-app"
          className="mt-3 block text-center font-heading text-[14px] text-link hover:underline"
        >
          Already have the app? Open it there
        </a>
      )}
    </div>
  );
}

/**
 * Phones and small screens: a bar pinned to the bottom with the same two actions. Pair it
 * with <SiteFooter joinBar />, which leaves room for it.
 */
export function JoinBar({
  label,
  listId,
  itemId,
}: {
  label: string;
  listId: string;
  itemId?: string;
}) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          {IS_ON_APP_STORE && (
            <a
              href={appURL(listId, itemId)}
              data-umami-event="open-in-app"
              className="btn-pill !min-h-12 shrink-0 !px-4"
            >
              Open in app
            </a>
          )}
          <GetAppButton label={label} className="flex-1 !min-h-12" />
        </div>
      </div>
    </>
  );
}
