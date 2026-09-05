const PROJECT_ID = "iow9ex5z";
const DATASET = "production";
const API = "2024-01-01";

export async function sanityFetch<T>(query: string): Promise<T> {
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(query)}&perspective=published`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`sanity ${res.status}`);
  return (await res.json()).result;
}

/** image-<id>-<w>x<h>-<ext> -> CDN url */
export function imageUrl(ref: string, width: number) {
  const [, id, dims, ext] = ref.split("-");
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dims}.${ext}?w=${width}&auto=format&fit=max`;
}

/** file-<id>-<ext> -> CDN url */
export function fileUrl(ref: string) {
  const [, id, ext] = ref.split("-");
  return `https://cdn.sanity.io/files/${PROJECT_ID}/${DATASET}/${id}.${ext}`;
}

export type Shot = { ref: string; alt?: string; title?: string; category?: string; discipline?: string };

export const SHOTS_QUERY =
  `*[_type=="project" && defined(image.asset._ref)]|order(order asc)` +
  `{title, category, discipline, "ref": image.asset._ref, "alt": image.alt}`;
