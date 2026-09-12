import WorksView, { type Group } from "./WorksView";
import { type Row } from "./ProjectList";
import { sanityFetch, imageUrl, fileUrl, CATEGORY_KEY } from "../../lib/sanity";

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
  album?: { ref?: string; alt?: string }[];
  tools?: string[];
  liveUrl?: string;
  behanceId?: string;
  pdf?: string;
};

type Folder = { key?: string; label?: string };

// One round trip: the renders, and the folders that group them. Folder order
// is set in the Studio, so adding a section there adds it here.
const QUERY =
  `{"docs": *[_type=="project"]|order(order asc)` +
  `{title, ${CATEGORY_KEY}, discipline, liveUrl, behanceId, "pdf": pdf.asset._ref, "ref": image.asset._ref, "alt": image.alt,` +
  ` "album": gallery[]{"ref": asset._ref, alt}, tools},` +
  `"folders": *[_type=="renderFolder"]|order(order asc){"key": slug.current, "label": title},` +
  `"more": *[_type=="siteSettings"][0].moreRendersUrl}`;

// ponytail: the pre-folder sections, used only while no renderFolder document
// exists. Delete once scripts/migrate-folders.mjs has run.
const SECTIONS: Folder[] = [
  { key: "frontpage", label: "Selected" },
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "workspace", label: "Workspace" },
  { key: "other", label: "Other" },
];
// the browser picks from these by slot width x device pixel ratio. 2000 is
// there for big monitors: 82vh on a 1440p screen is already a ~2100px slot.
const WIDTHS = [700, 1000, 1400, 2000];
// the gallery slot is height-driven (see .w-gallery in globals.css) - keep in
// step with the height there, or `sizes` starts lying again
const SLOT_VH = 82;

// the three list disciplines, in the order of the left-hand nav after "3d"
const LISTS: { discipline: string; subtitle: string }[] = [
  { discipline: "bim", subtitle: "BIM / Coordination" },
  { discipline: "frontend", subtitle: "Web / Development" },
  { discipline: "uiux", subtitle: "UI / UX Design" },
];
// behance 404s on a bare id - the trailing slug can be anything
const behanceUrl = (id: string) => `https://www.behance.net/gallery/${id}/project`;

/** Fallback for a UI/UX project that has not been through
 *  scripts/sync-behance.mjs yet - once it has, the name and cover live in
 *  Sanity and this never runs. Behance blocks datacenter IPs, so this is only
 *  reliable from a dev machine. Cached for an hour; failure keeps the doc.
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

/** A project is an album: the cover first, then every image dropped into it.
 *  A project with no cover is still an album, so this drives off the list, not
 *  the cover. */
const shots = (d: Doc): { ref: string; alt?: string }[] =>
  [{ref: d.ref, alt: d.alt}, ...(d.album ?? [])].filter(
    (s): s is {ref: string; alt?: string} => !!s.ref
  );

export default async function Works() {
  const { docs, folders, more } = await sanityFetch<{
    docs: Doc[];
    folders: Folder[];
    more?: string;
  }>(QUERY);

  const groups: Group[] = (folders.length ? folders : SECTIONS)
    .filter((f): f is { key: string; label: string } => !!f.key && !!f.label)
    .map(({ key, label }) => ({
      key,
      label,
      images: docs
        .filter((d) => d.category === key)
        .flatMap((d) =>
          shots(d).map((s) => {
            // image-<id>-<w>x<h>-<ext>: the shape is in the ref, so the gallery
            // can size the box before the file downloads
            const [w, h] = s.ref.split("-")[2].split("x").map(Number);
            return {
              src: imageUrl(s.ref, 1400),
              srcSet: WIDTHS.map((n) => `${imageUrl(s.ref, n)} ${n}w`).join(", "),
              // an album image left blank borrows the cover's words, then the title
              alt: s.alt ?? d.alt ?? d.title ?? "",
              ratio: `${w} / ${h}`,
              // the slot is as tall as SLOT_VH and as wide as the shape makes
              // it, so that is the only honest width to quote. A flat vw here
              // understates a landscape render by half and the browser picks a
              // file it then has to upscale - which is what looked blurry.
              sizes: `(max-width: 900px) 100vw, calc(${SLOT_VH}vh * ${(w / h).toFixed(3)})`,
              // the lightbox asks for the render at its own native width, so
              // this is the full thing - auto=format still hands over webp
              // rather than the original multi-megabyte file
              full: imageUrl(s.ref, w),
              title: d.title ?? "",
              tools: d.tools ?? [],
            };
          })
        ),
    }))
    .filter((g) => g.images.length > 0);

  const lists: Row[][] = await Promise.all(
    LISTS.map(({ discipline, subtitle }) =>
      Promise.all(
        docs
          .filter((d) => d.discipline === discipline)
          .map(async (d) => {
            // a synced project has its cover in Sanity - nothing left to scrape
            const meta = d.behanceId && !d.ref ? await behanceMeta(d.behanceId) : {};
            return {
              title: d.ref ? d.title! : meta.title ?? d.title ?? "Untitled",
              subtitle,
              href: d.liveUrl ?? (d.behanceId ? behanceUrl(d.behanceId) : undefined),
              img: d.ref ? imageUrl(d.ref, 700) : meta.img,
              pdf: d.pdf ? fileUrl(d.pdf) : undefined,
            };
          })
      )
    )
  );

  return <WorksView groups={groups} lists={lists} more={more} />;
}
