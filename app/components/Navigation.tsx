"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore Lists" },
    { href: "/about", label: "About" },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-white dark:bg-black shadow-xl hover:shadow-2xl transition-all duration-300"
        aria-label="Toggle navigation"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <span
            className={`block h-0.5 w-5 bg-black dark:bg-white transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-black dark:bg-white transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-black dark:bg-white transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </div>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Card */}
      <nav
        className={`fixed lg:sticky top-4 left-4 lg:top-8 lg:left-0 w-64 bg-white dark:bg-black rounded-lg shadow-feathered-lg z-40 transform transition-all duration-300 lg:translate-x-0 lg:opacity-100 ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 lg:opacity-100 lg:translate-x-0"
        }`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-purple-400 to-blue-400 flex items-center justify-center group-hover:shadow-xl transition-all duration-200">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-lg font-semibold text-black dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              The List of Us
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold px-4 py-3 rounded-lg hover:shadow-2xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300">
            Get the App
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Available on iOS
          </p>
        </div>
      </nav>
    </>
  );
}
