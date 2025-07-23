import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen lg:rounded-lg lg:overflow-hidden">
        {/* Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="p-5 pt-20 lg:pt-8">
            <div className="container mx-auto px-8 py-20">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-6xl md:text-4xl font-semibold mb-6 text-white leading-tight">
                  Share Your Dreams
                  <br />
                  <span className="relative inline-block">
                    {/* Blurred gradient backdrop */}
                    <span className="absolute inset-0 -z-10 bg-black/50 blur-sm rounded-lg p-1 scale-110"></span>
                    <span className="bg-gradient-to-b from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">
                      Together
                    </span>
                  </span>
                </h2>
                <p className="text-base font-semibold mb-8 max-w-2xl mx-auto text-white/90 leading-relaxed">
                  Create collaborative bucket lists with friends and family.
                  Turn your wildest dreams into shared adventures and make
                  memories that last a lifetime.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 text-white font-semibold px-10 py-3 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
                    Download for iOS
                  </button>
                  <button className="bg-white dark:bg-black text-black dark:text-white font-semibold px-10 py-3 rounded-lg shadow-lg border-2 border-transparent hover:shadow-xl transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="p-5 lg:pt-0">
        <div className="container mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h3 className="text-6xl md:text-4xl font-semibold mb-4 text-black dark:text-white leading-tight">
              Built for Connection
            </h3>
            <p className="text-base font-semibold max-w-2xl mx-auto text-gray-700 dark:text-gray-300 leading-relaxed">
              Every feature is designed to bring people together and turn
              individual dreams into shared experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-black rounded-lg shadow-feathered p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🌟</span>
              </div>
              <h4 className="text-base font-semibold mb-4 text-black dark:text-white leading-relaxed">
                Collaborative Lists
              </h4>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                Create shared bucket lists where everyone can contribute ideas,
                vote on favorites, and plan together.
              </p>
            </div>

            <div className="bg-white dark:bg-black rounded-lg shadow-feathered p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h4 className="text-base font-semibold mb-4 text-black dark:text-white leading-relaxed">
                Rich Sharing
              </h4>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                Beautiful previews when sharing lists in Messages, Mail, and
                social media. Invite friends with style.
              </p>
            </div>

            <div className="bg-white dark:bg-black rounded-lg shadow-feathered p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">✅</span>
              </div>
              <h4 className="text-base font-semibold mb-4 text-black dark:text-white leading-relaxed">
                Track Progress
              </h4>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                Check off completed dreams together and celebrate your shared
                achievements as a group.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section
        id="download"
        className="p-5 bg-gradient-to-b from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 lg:rounded-lg lg:mx-4"
      >
        <div className="container mx-auto px-8 py-20 text-center">
          <h3 className="text-6xl md:text-4xl font-semibold text-white mb-4 leading-tight">
            Start Your Journey Today
          </h3>
          <p className="text-base font-semibold text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of dreamers who are already sharing their bucket
            lists and making memories together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white dark:bg-black text-black dark:text-white font-semibold text-base px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Download for iOS
            </button>
            <button className="text-white font-semibold text-base px-8 py-4 rounded-lg border-2 border-white bg-transparent hover:bg-white/10 transition-all duration-300">
              Coming Soon: Android
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black lg:rounded-lg lg:mx-4 lg:mt-8">
        <div className="container mx-auto px-8 py-12">
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
  );
}
