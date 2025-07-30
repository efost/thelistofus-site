"use client";

import { useEffect, useState } from "react";

interface AppDeepLinkProps {
  listId: string;
}

export default function AppDeepLink({ listId }: AppDeepLinkProps) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Try to open the app immediately
    const customSchemeUrl = `thelistofus://list/${listId}`;
    const universalLink = `thelist://list/${listId}`;

    // Function to try opening the app
    const tryOpenApp = () => {
      // Try universal link first
      window.location.href = universalLink;

      // Set a timeout to try custom scheme as fallback
      setTimeout(() => {
        window.location.href = customSchemeUrl;

        // Set another timeout to show website content if app didn't open
        setTimeout(() => {
          setShowFallback(true);
        }, 2000);
      }, 100);
    };

    // Try to open the app
    tryOpenApp();
  }, [listId]);

  // Show nothing while attempting to open the app
  if (!showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Opening in app...</p>
        </div>
      </div>
    );
  }

  // Return null to allow the main content to render
  return null;
}
