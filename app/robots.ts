import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {userAgent: "*", allow: "/"},
    sitemap: `${await siteUrl()}/sitemap.xml`,
  };
}
