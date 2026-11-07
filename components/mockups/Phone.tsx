// An iPhone drawn in CSS around a 393×852 screen, scaled down to `width`.
// The screens inside are real HTML in the app's styles, so they stay sharp,
// follow light/dark mode, and never go stale the way screenshots do.

const SCREEN_W = 393;
const SCREEN_H = 852;

export default function Phone({
  width = 300,
  children,
  className = "",
  label,
  shadow = "float",
}: {
  width?: number;
  children: React.ReactNode;
  className?: string;
  label?: string;
  /** float: a drop shadow of its own; soft: a short one; none: the page supplies the ground. */
  shadow?: "float" | "soft" | "none";
}) {
  const drop =
    shadow === "float"
      ? "0 40px 80px -30px rgba(20, 20, 60, 0.45), "
      : shadow === "soft"
        ? "0 24px 48px -28px rgba(20, 20, 60, 0.4), "
        : "";
  const bezel = Math.round(width * 0.035);
  const inner = width - bezel * 2;
  const scale = inner / SCREEN_W;
  const height = Math.round(SCREEN_H * scale) + bezel * 2;
  return (
    <div
      className={`shrink-0 ${className.includes("absolute") ? "" : "relative"} ${className}`}
      style={{
        width,
        height,
        padding: bezel,
        borderRadius: width * 0.17,
        background: "linear-gradient(145deg, #2b2b2f, #0c0c0e)",
        boxShadow: `${drop}0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 0 1.5px #3a3a3e`,
      }}
      role="img"
      aria-label={label}
    >
      <div
        className="relative overflow-hidden bg-surface"
        style={{
          width: inner,
          height: height - bezel * 2,
          borderRadius: width * 0.17 - bezel,
        }}
      >
        <div
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          aria-hidden
        >
          {children}
        </div>
        {/* Dynamic Island */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
          style={{ top: 11 * scale, width: 124 * scale, height: 36 * scale }}
        />
      </div>
    </div>
  );
}

/** The status bar row at the top of every mock screen. */
export function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div
      className="flex h-[54px] items-center justify-between px-9 pt-1 font-heading text-[17px]"
      style={{ color: light ? "#fff" : "var(--ink)" }}
    >
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.5c2.2 0 4.2.9 5.7 2.3l1.2-1.2A9.7 9.7 0 0 0 8 .8 9.7 9.7 0 0 0 1.1 3.6l1.2 1.2A8 8 0 0 1 8 2.5zm0 3.4c1.3 0 2.5.5 3.4 1.4l1.2-1.2A6.5 6.5 0 0 0 8 4.2c-1.8 0-3.4.7-4.6 1.9l1.2 1.2c.9-.9 2.1-1.4 3.4-1.4zM8 9.3c.4 0 .8.2 1.1.5L8 11 6.9 9.8c.3-.3.7-.5 1.1-.5z" />
        </svg>
        <span className="relative inline-block h-[13px] w-[26px] rounded-[4px] border border-current opacity-90">
          <span className="absolute inset-[1.5px] right-[5px] rounded-[2px] bg-current" />
        </span>
      </span>
    </div>
  );
}
