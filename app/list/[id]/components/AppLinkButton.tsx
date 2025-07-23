"use client";

import { useState } from "react";

interface AppLinkButtonProps {
  listId: string;
}

export default function AppLinkButton({ listId }: AppLinkButtonProps) {
  const [showFallback, setShowFallback] = useState(false);

  const handleAppLink = () => {
    const customSchemeUrl = `thelistofus://list/${listId}`;

    // Try to open with custom scheme
    window.location.href = customSchemeUrl;

    // Set a timeout to show App Store link if app didn't open
    setTimeout(() => {
      setShowFallback(true);
    }, 2000);
  };

  return (
    <div className="text-center mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Already have the app?
      </p>

      {!showFallback ? (
        <button
          onClick={handleAppLink}
          className="inline-flex items-center space-x-2 bg-white dark:bg-black text-black dark:text-white font-semibold px-6 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
        >
          <span>📱</span>
          <span>View in App</span>
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            App not installed?
          </p>
          <a
            href="https://apps.apple.com/app/YOUR_APP_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 text-white font-semibold px-6 py-3 text-base rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <span>📱</span>
            <span>Download App</span>
          </a>
        </div>
      )}
    </div>
  );
}
