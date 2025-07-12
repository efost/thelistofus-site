import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ListPageProps {
  params: Promise<{ id: string }>;
}

// This would typically come from your API/database
// For now, we'll simulate fetching list data
async function getListData(id: string) {
  // In a real app, you'd fetch this from your backend
  // For demo purposes, we'll return mock data
  if (id === "demo") {
    return {
      id: "demo",
      title: "Adventure Bucket List",
      description: "Epic adventures we want to experience together",
      owner: "Sarah & Friends",
      itemCount: 12,
      completedCount: 3,
      items: [
        { id: 1, text: "Skydiving in New Zealand", completed: true },
        { id: 2, text: "Northern Lights in Iceland", completed: false },
        { id: 3, text: "Safari in Kenya", completed: false },
        { id: 4, text: "Hiking Machu Picchu", completed: true },
        {
          id: 5,
          text: "Scuba diving in the Great Barrier Reef",
          completed: false,
        },
        { id: 6, text: "Road trip across Route 66", completed: true },
      ],
      createdAt: "2024-01-15",
      imageUrl: "/api/og?listId=demo", // Dynamic OG image
    };
  }

  // Return null if list not found
  return null;
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const { id } = await params;
  const listData = await getListData(id);

  if (!listData) {
    return {
      title: "List Not Found",
      description: "The requested list could not be found.",
    };
  }

  const { title, description, owner, itemCount, completedCount } = listData;
  const progress = Math.round((completedCount / itemCount) * 100);

  return {
    title: `${title} - The List of Us`,
    description: `${description} | ${completedCount}/${itemCount} completed (${progress}%) | Created by ${owner}`,
    openGraph: {
      title: title,
      description: `${description} | ${completedCount}/${itemCount} completed (${progress}%)`,
      type: "website",
      locale: "en_US",
      url: `https://thelistofus.com/list/${id}`,
      siteName: "The List of Us",
      images: [
        {
          url: `/api/og?listId=${id}`,
          width: 1200,
          height: 630,
          alt: `${title} - The List of Us`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: `${description} | ${completedCount}/${itemCount} completed (${progress}%)`,
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
  const listData = await getListData(id);

  if (!listData) {
    notFound();
  }

  const {
    title,
    description,
    owner,
    items,
    itemCount,
    completedCount,
    createdAt,
  } = listData;
  const progress = Math.round((completedCount / itemCount) * 100);

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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src="/the-list-of-us-icon.png"
                      alt="The List of Us"
                      width={32}
                      height={32}
                    />
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
                      {title}
                    </h1>
                    <p
                      className="text-big mb-4"
                      style={{ color: "var(--foreground-secondary)" }}
                    >
                      {description}
                    </p>
                    <div
                      className="flex items-center space-x-4 text-body"
                      style={{ color: "var(--foreground-tertiary)" }}
                    >
                      <span>Created by {owner}</span>
                      <span>•</span>
                      <span>{new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-large-title text-gradient">
                      {progress}%
                    </div>
                    <div
                      className="text-body"
                      style={{ color: "var(--foreground-tertiary)" }}
                    >
                      {completedCount} of {itemCount} completed
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
                      width: `${progress}%`,
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
              className="text-large-title mb-6"
              style={{ color: "var(--foreground)" }}
            >
              Bucket List Items
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-4 p-4 border-2 transition-all`}
                  style={{
                    background: item.completed
                      ? "var(--background-secondary)"
                      : "var(--background)",
                    borderColor: item.completed
                      ? "var(--foreground-tertiary)"
                      : "var(--foreground-tertiary)",
                    opacity: item.completed ? 0.7 : 1,
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center`}
                    style={{
                      background: item.completed
                        ? "var(--gradient)"
                        : "var(--foreground-tertiary)",
                      opacity: item.completed ? 1 : 0.3,
                    }}
                  >
                    {item.completed && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  <span
                    className={`flex-1 text-item-name ${
                      item.completed ? "line-through" : ""
                    }`}
                    style={{
                      color: item.completed
                        ? "var(--foreground-secondary)"
                        : "var(--foreground)",
                    }}
                  >
                    {item.text}
                  </span>
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src="/the-list-of-us-icon.png"
                      alt="The List of Us"
                      width={32}
                      height={32}
                    />
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
