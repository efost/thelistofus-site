import Image from "next/image";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background-secondary)" }}
    >
      {/* Header and Hero Section with Background */}
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
                <nav className="hidden md:flex space-x-8">
                  <a
                    href="#features"
                    className="text-body transition-colors text-white opacity-90 hover:opacity-100"
                  >
                    Features
                  </a>
                  <a
                    href="#download"
                    className="text-body transition-colors text-white opacity-90 hover:opacity-100"
                  >
                    Download
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="section-spacing">
            <div className="container mx-auto px-4 py-20">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-title mb-6 text-white">
                  Share Your Dreams
                  <br />
                  <span
                    className="text-gradient relative inline-block"
                    style={{
                      background: "var(--gradient)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {/* Blurred gradient backdrop */}
                    <span
                      className="absolute inset-0 -z-10"
                      style={{
                        background: "rgba(0, 0, 0, 0.5)",
                        filter: "blur(8px)",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        transform: "scale(1.1)",
                      }}
                    ></span>
                    Together
                  </span>
                </h2>
                <p className="text-big mb-8 max-w-2xl mx-auto text-white opacity-90">
                  Create collaborative bucket lists with friends and family.
                  Turn your wildest dreams into shared adventures and make
                  memories that last a lifetime.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-primary px-10 text-big h-10">
                    Download for iOS
                  </button>
                  <button
                    className="btn-floating text-big transition-all px-10 h-10"
                    style={{
                      color: "var(--foreground)",
                      border: "2px solid transparent",
                      background: "var(--background)",
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="section-spacing">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h3
              className="text-title mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Built for Connection
            </h3>
            <p
              className="text-big max-w-2xl mx-auto"
              style={{ color: "var(--foreground-secondary)" }}
            >
              Every feature is designed to bring people together and turn
              individual dreams into shared experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--gradient)" }}
              >
                <span className="text-white text-2xl">🌟</span>
              </div>
              <h4
                className="text-item-name mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Collaborative Lists
              </h4>
              <p
                className="text-body"
                style={{ color: "var(--foreground-secondary)" }}
              >
                Create shared bucket lists where everyone can contribute ideas,
                vote on favorites, and plan together.
              </p>
            </div>

            <div className="card text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--gradient)" }}
              >
                <span className="text-white text-2xl">📱</span>
              </div>
              <h4
                className="text-item-name mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Rich Sharing
              </h4>
              <p
                className="text-body"
                style={{ color: "var(--foreground-secondary)" }}
              >
                Beautiful previews when sharing lists in Messages, Mail, and
                social media. Invite friends with style.
              </p>
            </div>

            <div className="card text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--gradient)" }}
              >
                <span className="text-white text-2xl">✅</span>
              </div>
              <h4
                className="text-item-name mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Track Progress
              </h4>
              <p
                className="text-body"
                style={{ color: "var(--foreground-secondary)" }}
              >
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
        className="section-spacing"
        style={{ background: "var(--gradient)" }}
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <h3 className="text-title text-white mb-4">
            Start Your Journey Today
          </h3>
          <p className="text-big text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of dreamers who are already sharing their bucket
            lists and making memories together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="btn-floating text-big transition-all"
              style={{
                color: "var(--foreground)",
                background: "var(--background)",
              }}
            >
              Download for iOS
            </button>
            <button
              className="text-big transition-all px-8 py-4"
              style={{
                color: "white",
                border: "2px solid white",
                borderRadius: "var(--radius-lg)",
                background: "transparent",
              }}
            >
              Coming Soon: Android
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--background)" }}>
        <div className="container mx-auto px-4 py-12">
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
              <span className="text-big" style={{ color: "var(--foreground)" }}>
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
  );
}
