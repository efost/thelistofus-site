import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { APP_STORE_ID, SITE_NAME, SITE_URL, TAGLINE, UMAMI_WEBSITE_ID } from "@/lib/site";
import "./globals.css";

// The app's two faces (same files as the iOS app's Fonts folder).
const bricolage = localFont({
  src: "../fonts/TLBricolage-Bold.ttf",
  weight: "700",
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = localFont({
  src: "../fonts/TLDMSans-Regular.ttf",
  weight: "400",
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: a shared place for all the things you keep meaning to check out`,
    template: `%s · ${SITE_NAME}`,
  },
  description: TAGLINE,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  // Safari's Smart App Banner, once the app has an App Store id; it offers the App Clip
  // (st.efo.The-List.Clip) to people who don't have the app.
  ...(APP_STORE_ID
    ? {
        other: {
          "apple-itunes-app": `app-id=${APP_STORE_ID}, app-clip-bundle-id=st.efo.The-List.Clip, app-clip-display=card`,
        },
      }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh bg-surface text-ink">
        {children}
        {/* Umami Cloud: cookie-free page views, plus the data-umami-event clicks. */}
        {UMAMI_WEBSITE_ID && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={UMAMI_WEBSITE_ID}
            data-domains={new URL(SITE_URL).hostname}
            data-do-not-track="true"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
