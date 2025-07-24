"use client";

import { ListItem } from "@/lib/lists";
import { NotepadText } from "lucide-react";
import { useState } from "react";

interface ListItemsProps {
  items: ListItem[];
}

const ListItemCard = ({ item }: { item: ListItem }) => {
  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg transition-all bg-white dark:bg-black">
      <div
        className={`w-6 h-6 mt-2.5 rounded-full flex items-center justify-center ${
          item.done
            ? "bg-gradient-to-b from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
            : "border border-gray-300 dark:border-gray-600"
        }`}
      >
        {item.done && <span className="text-white text-sm">✓</span>}
      </div>
      <div className="flex-1">
        <span className="text-base font-semibold text-black dark:text-white">
          {item.name}
        </span>
        {(item.address || item.city || item.notes) && (
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {item.address && item.city && `${item.address}, ${item.city}`}
            {item.notes && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="flex items-start space-x-2">
                  <NotepadText className="size-4 mt-0.5 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed tracking-wide">
                    {item.notes}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ListItems({ items }: ListItemsProps) {
  const [activeTab, setActiveTab] = useState<"todo" | "completed">("todo");

  const incompleteItems = items
    .filter((item) => !item.done)
    .sort((a, b) => a.name.localeCompare(b.name));

  const completedItems = items
    .filter((item) => item.done)
    .sort((a, b) => a.name.localeCompare(b.name));

  const currentItems = activeTab === "todo" ? incompleteItems : completedItems;

  return (
    <div>
      {/* Minimalist Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
        <button
          onClick={() => setActiveTab("todo")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "todo"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          To Do ({incompleteItems.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ml-6 ${
            activeTab === "completed"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Completed ({completedItems.length})
        </button>
      </div>

      {/* Items Display */}
      <div>
        {currentItems.length > 0 ? (
          currentItems.map((item) => <ListItemCard key={item.id} item={item} />)
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {activeTab === "todo"
              ? "All items completed! 🎉"
              : "No completed items yet."}
          </div>
        )}
      </div>
    </div>
  );
}
