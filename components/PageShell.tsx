import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/** A plain reading page (privacy, support). */
export default function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader showExample />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-12 md:pt-16">
        <h1 className="text-[40px] leading-[1.05] tracking-[-0.02em] md:text-[52px]">{title}</h1>
        {intro && <p className="mt-4 text-[19px] leading-relaxed text-muted">{intro}</p>}
        <div className="prose-page mt-6 text-[17px] leading-relaxed">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
