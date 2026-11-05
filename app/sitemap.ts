import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Shared lists are left out on purpose: they're for the people they were sent to.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/list/example", "/support", "/privacy"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
  }));
}
