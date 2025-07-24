import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The List of Us",
  description:
    "Share your dreams together - Create collaborative bucket lists with friends and family",
  icons: {
    icon: "/the-list-of-us-icon.png",
    shortcut: "/the-list-of-us-icon.png",
    apple: "/the-list-of-us-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-black dark:text-white min-h-screen">
        <div className="lg:flex lg:gap-8 lg:p-8 lg:max-w-7xl lg:mx-auto">
          {/* <div className="lg:w-64 lg:flex-shrink-0">
            <Navigation />
          </div> */}
          <main className="lg:flex-1 min-h-screen">{children}</main>
        </div>
      </body>
    </html>
  );
}
