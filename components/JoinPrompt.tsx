import { appURL, APP_NAME } from "@/lib/site";
import AppIcon from "./AppIcon";
import GetAppButton from "./GetAppButton";

/** Desktop sidebar card: what you get by joining in the app. */
export function JoinCard({
  title,
  body,
  listId,
  itemId,
}: {
  title: string;
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
          <div className="text-[14px] text-muted">{APP_NAME} for iPhone</div>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
      <GetAppButton className="mt-4 w-full" />
      <a
        href={appURL(listId, itemId)}
        className="mt-3 block text-center font-heading text-[14px] text-link hover:underline"
      >
        Already have the app? Open it there
      </a>
    </div>
  );
}

/** Phones and small screens: a bar pinned to the bottom with the same two actions. */
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
      <div className="h-24 lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <a href={appURL(listId, itemId)} className="btn-pill !min-h-12 shrink-0 !px-4">
            Open in app
          </a>
          <GetAppButton label={label} className="flex-1 !min-h-12" />
        </div>
      </div>
    </>
  );
}
