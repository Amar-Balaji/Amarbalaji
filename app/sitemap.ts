import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await siteUrl();
  const now = new Date();
  return ["", "/works", "/about", "/contact"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    priority: path === "" ? 1 : 0.8,
  }));
}
