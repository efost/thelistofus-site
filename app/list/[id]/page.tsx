import { calculateProgress, getListById } from "@/lib/lists";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ListPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const { id } = await params;
  const listData = await getListById(id);

  if (!listData) {
    return {
      title: "List Not Found",
      description: "The requested list could not be found.",
    };
  }

  const { name, ownerName } = listData;
  const progress = calculateProgress(listData);

  return {
    title: `${name} - The List of Us`,
    description: `${name} | ${progress.completed}/${progress.total} completed (${progress.percentage}%) | Created by ${ownerName}`,
    openGraph: {
      title: name,
      description: `${name} | ${progress.completed}/${progress.total} completed (${progress.percentage}%)`,
      type: "website",
      locale: "en_US",
      url: `https://thelistofus.com/list/${id}`,
      siteName: "The List of Us",
      images: [
        {
          url: `/api/og?listId=${id}`,
          width: 1200,
          height: 630,
          alt: `${name} - Bucket List`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: `${name} | ${progress.completed}/${progress.total} completed (${progress.percentage}%)`,
      images: [`/api/og?listId=${id}`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ListPage({ params }: ListPageProps) {
  const { id } = await params;
  const listData = await getListById(id);

  if (!listData) {
    notFound();
  }

  const progress = calculateProgress(listData);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background-secondary)" }}
    >
      {/* Header and List Header with Background */}
      <div
        className="relative"
        style={{
          backgroundImage: "url(/tlou-banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div
          className="absolute inset-0 bg-black opacity-40"
          style={{ zIndex: 1 }}
        ></div>

        {/* Content */}
        <div className="relative" style={{ zIndex: 2 }}>
          {/* Header */}
          <header className="section-spacing">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--gradient)" }}
                  >
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <h1 className="text-big text-white">The List of Us</h1>
                </div>
                <Link
                  href="/"
                  className="text-body transition-colors text-white opacity-90 hover:opacity-100"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </header>

          {/* List Header */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="card mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1
                      className="text-title mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {listData.name}
                    </h1>
                    <p
                      className="text-big mb-4"
                      style={{ color: "var(--foreground-secondary)" }}
                    >
                      Created by {listData.ownerName}
                    </p>
                    <div
                      className="flex items-center space-x-4 text-body"
                      style={{ color: "var(--foreground-tertiary)" }}
                    >
                      <span>
                        Last updated{" "}
                        {listData.lastModifiedAt.toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{listData.collaborators.length} collaborators</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-large-title text-gradient">
                      {progress.percentage}%
                    </div>
                    <div
                      className="text-body"
                      style={{ color: "var(--foreground-tertiary)" }}
                    >
                      {progress.completed} of {progress.total} completed
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full h-3 mb-6"
                  style={{
                    background: "var(--foreground-tertiary)",
                    opacity: 0.2,
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div
                    className="h-3 transition-all duration-300"
                    style={{
                      width: `${progress.percentage}%`,
                      background: "var(--gradient)",
                      borderRadius: "var(--radius-md)",
                    }}
                  />
                </div>

                {/* CTA */}
                <div className="text-center">
                  <button className="btn-primary px-8 py-3 text-big">
                    Join This List
                  </button>
                  <p
                    className="text-body mt-2"
                    style={{ color: "var(--foreground-tertiary)" }}
                  >
                    Download The List of Us app to collaborate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* List Items */}
          <div className="card">
            <h2
              className="text-title mb-6"
              style={{ color: "var(--foreground)" }}
            >
              Bucket List Items
            </h2>
            <div className="space-y-4">
              {listData.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-4 p-4 border-2 transition-all`}
                  style={{
                    background: item.done
                      ? "var(--background-secondary)"
                      : "var(--background)",
                    borderColor: item.done
                      ? "var(--foreground-tertiary)"
                      : "var(--foreground-tertiary)",
                    opacity: item.done ? 0.7 : 1,
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center`}
                    style={{
                      background: item.done
                        ? "var(--gradient)"
                        : "var(--foreground-tertiary)",
                      opacity: item.done ? 1 : 0.3,
                    }}
                  >
                    {item.done && <span className="text-white text-sm">✓</span>}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-item-name ${
                        item.done ? "line-through" : ""
                      }`}
                      style={{
                        color: item.done
                          ? "var(--foreground-secondary)"
                          : "var(--foreground)",
                      }}
                    >
                      {item.name}
                    </span>
                    {(item.address || item.city || item.notes) && (
                      <div
                        className="text-body mt-1"
                        style={{ color: "var(--foreground-tertiary)" }}
                      >
                        {item.address &&
                          item.city &&
                          `${item.address}, ${item.city}`}
                        {item.notes && (
                          <span className="block mt-1">{item.notes}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Download CTA */}
          <div
            className="text-center mt-8 card-spacing"
            style={{
              background: "var(--gradient)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <h3 className="text-title text-white mb-4">
              Ready to Create Your Own List?
            </h3>
            <p className="text-big text-white opacity-90 mb-6">
              Join thousands of dreamers sharing their bucket lists and making
              memories together.
            </p>
            <button
              className="btn-floating text-big transition-all"
              style={{
                color: "var(--foreground)",
                background: "var(--background)",
              }}
            >
              Download The List of Us
            </button>
          </div>

          {/* Footer */}
          <footer className="mt-8" style={{ background: "var(--background)" }}>
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--gradient)" }}
                  >
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <span
                    className="text-big"
                    style={{ color: "var(--foreground)" }}
                  >
                    The List of Us
                  </span>
                </div>
                <div className="flex items-center space-x-6">
                  <a
                    href="#"
                    className="text-body transition-colors"
                    style={{ color: "var(--foreground-tertiary)" }}
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-body transition-colors"
                    style={{ color: "var(--foreground-tertiary)" }}
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="text-body transition-colors"
                    style={{ color: "var(--foreground-tertiary)" }}
                  >
                    Support
                  </a>
                  <span
                    className="text-body"
                    style={{ color: "var(--foreground-tertiary)" }}
                  >
                    &copy; 2024 The List of Us. All rights reserved.
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
