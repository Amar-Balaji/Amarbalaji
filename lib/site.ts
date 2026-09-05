import { sanityFetch } from "./sanity";

/**
 * The absolute origin, needed by anything a crawler reads. Set it in Studio
 * under Site settings; on Vercel the deployment domain stands in until you do.
 */
export async function siteUrl() {
  const s = await sanityFetch<{ siteUrl?: string }>(
    `*[_type=="siteSettings"][0]{siteUrl}`
  );
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (
    s?.siteUrl?.replace(/\/$/, "") ??
    (vercel ? `https://${vercel}` : "http://localhost:3000")
  );
}
