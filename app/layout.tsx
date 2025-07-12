import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Using Inter as fallback until Omnes font is added
// To add Omnes: place font files in /public/fonts/ and add @font-face declarations to globals.css
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The List of Us",
  description:
    "Share your bucket list with the people you care about most. Create, collaborate, and achieve your dreams together.",
  keywords: [
    "bucket list",
    "goals",
    "collaboration",
    "sharing",
    "dreams",
    "group planning",
  ],
  authors: [{ name: "The List of Us Team" }],
  openGraph: {
    title: "The List of Us",
    description: "Share your bucket list with the people you care about most.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "The List of Us - Share Your Dreams Together",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The List of Us",
    description: "Share your bucket list with the people you care about most.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
