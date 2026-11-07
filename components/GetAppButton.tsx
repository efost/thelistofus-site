import { APP_STORE_URL, IS_ON_APP_STORE } from "@/lib/site";

function AppleGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.89 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.09 1.75-.96 2.79 1.02.08 2.05-.52 2.68-1.27z" />
    </svg>
  );
}

/**
 * The primary "get the app" action: the App Store, or until the app is there, the home
 * page's waitlist (labelled "Join the waitlist" unless `preLaunchLabel` says otherwise).
 */
export default function GetAppButton({
  label,
  preLaunchLabel,
  size = "md",
  className = "",
}: {
  label?: string;
  preLaunchLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const text = IS_ON_APP_STORE ? (label ?? "Get the app") : (preLaunchLabel ?? "Join the waitlist");
  const sizing =
    size === "sm"
      ? "!min-h-10 !px-4 !text-[15px]"
      : size === "lg"
        ? "!min-h-14 !px-7 !text-[18px]"
        : "";
  const external = APP_STORE_URL.startsWith("http");
  return (
    <a
      href={APP_STORE_URL}
      data-umami-event="get-the-app"
      className={`btn-primary ${sizing} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {IS_ON_APP_STORE && <AppleGlyph size={size === "sm" ? 16 : 19} />}
      {text}
    </a>
  );
}
