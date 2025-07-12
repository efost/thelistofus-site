import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background-secondary)" }}
    >
      <div className="text-center max-w-md mx-auto px-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "var(--gradient)" }}
        >
          <span className="text-white text-3xl">?</span>
        </div>

        <h1
          className="text-title mb-4 whitespace-nowrap"
          style={{ color: "var(--foreground)" }}
        >
          List Not Found
        </h1>

        <p
          className="text-big mb-8"
          style={{ color: "var(--foreground-secondary)" }}
        >
          This bucket list doesn&apos;t exist or has been made private. Ask the
          owner to share the correct link with you.
        </p>

        <div className="space-y-4">
          <Link href="/" className="btn-primary block px-8 py-3 text-big">
            Go to Homepage
          </Link>

          <p
            className="text-body"
            style={{ color: "var(--foreground-tertiary)" }}
          >
            or download The List of Us app to create your own
          </p>
        </div>
      </div>
    </div>
  );
}
