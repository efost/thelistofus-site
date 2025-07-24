"use client";

export default function StickyBanner({ listId }: { listId: string }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto">
        <a
          href={`thelist://list/${listId}`}
          className="w-full text-center block bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 text-white font-semibold px-8 py-4 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Join This List in the App
        </a>
      </div>
    </div>
  );
}
