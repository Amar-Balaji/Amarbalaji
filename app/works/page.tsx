import WorksView, { type Group } from "./WorksView";
import { type Row } from "./ProjectList";
import { sanityFetch, imageUrl } from "../../lib/sanity";

export const revalidate = 60;

export const metadata = {
  title: "Works",
  description: "3D architectural visualisation, BIM coordination, front end and UI/UX projects.",
};

type Doc = {
  title?: string;
  category?: string;
  discipline?: string;
  ref?: string;
  alt?: string;
  liveUrl?: string;
  behanceId?: string;
};

const QUERY =
  `*[_type=="project"]|order(order asc)` +
  `{title, category, discipline, liveUrl, behanceId, "ref": image.asset._ref, "alt": image.alt}`;

const SECTIONS: Record<string, string> = {
  frontpage: "Selected",
  residential: "Residential",
  commercial: "Commercial",
  workspace: "Workspace",
  other: "Other",
};
// the gallery slot is 38vw on desktop, full width below 900px - the browser
// picks from these by slot width x device pixel ratio
const WIDTHS = [700, 1000, 1400];

// the three list disciplines, in the order of the left-hand nav after "3d"
const LISTS: { discipline: string; subtitle: string }[] = [
  { discipline: "bim", subtitle: "BIM / Coordination" },
  { discipline: "frontend", subtitle: "Web / Development" },
  { discipline: "uiux", subtitle: "UI / UX Design" },
];
// behance 404s on a bare id - the trailing slug can be anything
const behanceUrl = (id: string) => `https://www.behance.net/gallery/${id}/project`;

/** Behance holds the real name and cover for these projects; Sanity only has
 *  placeholders. Cached for an hour; any failure falls back to the Sanity doc.
 *  The <title> is used over og:title - og:title appends the author name, and
 *  one of the project names contains a dash itself. */
const decode = (s: string) =>
  s.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) =>
    e[0] === "#"
      ? String.fromCodePoint(
          e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))
        )
      : ({amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " "} as Record<string, string>)[
          e.toLowerCase()
        ] ?? m
  );

async function behanceMeta(id: string): Promise<{ title?: string; img?: string }> {
  try {
    const r = await fetch(behanceUrl(id), {
      headers: { "user-agent": "Mozilla/5.0" },
      // behance is not ours; a hang here would stall the page rebuild
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (!r.ok) return {};
    const html = await r.text();
    const title = html.match(/<title>([^<]*?)\s*::\s*Behance<\/title>/i)?.[1];
    return {
      title: title && decode(title),
      img: html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1],
    };
  } catch {
    return {};
  }
}

export default async function Works() {
  const docs = await sanityFetch<Doc[]>(QUERY);

  const groups: Group[] = Object.keys(SECTIONS)
    .map((key) => ({
      key,
      label: SECTIONS[key],
      images: docs
        .filter((d) => d.category === key && d.ref)
        .map((d) => ({
          src: imageUrl(d.ref!, 1400),
          srcSet: WIDTHS.map((w) => `${imageUrl(d.ref!, w)} ${w}w`).join(", "),
          alt: d.alt ?? d.title ?? "",
        })),
    }))
    .filter((g) => g.images.length > 0);

  const lists: Row[][] = await Promise.all(
    LISTS.map(({ discipline, subtitle }) =>
      Promise.all(
        docs
          .filter((d) => d.discipline === discipline)
          .map(async (d) => {
            const meta = d.behanceId ? await behanceMeta(d.behanceId) : {};
            return {
              title: meta.title ?? d.title ?? "Untitled",
              subtitle,
              href: d.liveUrl ?? (d.behanceId ? behanceUrl(d.behanceId) : undefined),
              img: d.ref ? imageUrl(d.ref, 700) : meta.img,
            };
          })
      )
    )
  );

  // placeholder: no bim documents in Sanity yet, so borrow the dev projects
  if (lists[0].length === 0) {
    lists[0] = lists[1].map((r) => ({ ...r, subtitle: "BIM / Coordination — placeholder" }));
  }

  return <WorksView groups={groups} lists={lists} />;
}
