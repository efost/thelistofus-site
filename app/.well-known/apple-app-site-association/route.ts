import { aasaResponse } from "@/lib/aasa";

export const dynamic = "force-static";

export function GET() {
  return aasaResponse();
}
