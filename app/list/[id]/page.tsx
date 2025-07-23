import { calculateProgress, getListById } from "@/lib/lists";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ListItems from "./components/ListItems";

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
    <div className="min-h-screen">
      {/* Header and List Header */}
      <div className="relative lg:rounded-lg lg:overflow-hidden">
        {/* Content */}
        <div className="relative z-10">
          {/* List Header */}
          <div className="container mx-auto px-8 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-black rounded-lg shadow-feathered-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-6xl md:text-4xl font-semibold mb-2 text-black dark:text-white leading-tight">
                      {listData.name}
                    </h1>
                    <p className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">
                      Created by {listData.ownerName}
                    </p>
                    <div className="flex items-center space-x-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <span>
                        Last updated{" "}
                        {listData.lastModifiedAt.toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{listData.collaborators.length} collaborators</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold bg-gradient-to-b from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {progress.percentage}%
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {progress.completed} of {progress.total} completed
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 mb-6 bg-gray-300 dark:bg-gray-700 bg-opacity-20 rounded-md">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-md transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                {/* List Items */}
                <ListItems items={listData.items} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Content */}
      <main className="container mx-auto px-8 pt-0">
        <div className="max-w-4xl mx-auto">
          {/* App Download CTA */}
          <div className="text-center p-8 bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 rounded-2xl lg:rounded-lg">
            <h3 className="text-6xl md:text-4xl font-semibold text-white mb-4 leading-tight">
              Ready to Create Your Own List?
            </h3>
            <p className="text-base font-semibold text-white/90 mb-6 leading-relaxed">
              Join thousands of dreamers sharing their bucket lists and making
              memories together.
            </p>
            <button className="bg-white dark:bg-black text-black dark:text-white font-semibold text-base px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Download The List of Us
            </button>
          </div>

          {/* Footer */}
          <footer className="mt-8 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <span className="text-base font-semibold text-black dark:text-white">
                    The List of Us
                  </span>
                </div>
                <div className="flex items-center space-x-6">
                  <a
                    href="#"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Support
                  </a>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
