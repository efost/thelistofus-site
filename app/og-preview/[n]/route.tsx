import { option1, option2, option3, option4 } from "@/lib/og-home-options";

// Exploration only: /og-preview/1 … /og-preview/4.
const OPTIONS = [option1, option2, option3, option4];

export async function GET(_: Request, { params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const draw = OPTIONS[Number(n) - 1];
  return draw ? draw() : new Response("Not found", { status: 404 });
}
