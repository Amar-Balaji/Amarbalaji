import WorksView, { type Group } from "./WorksView";
import { type Row } from "./ProjectList";
import { sanityFetch, imageUrl } from "../../lib/sanity";

export const revalidate = 60;

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
const BEHANCE = "https://www.behance.net/amar_balaji";

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

  const lists: Row[][] = LISTS.map(({ discipline, subtitle }) =>
    docs
      .filter((d) => d.discipline === discipline)
      .map((d) => ({
        title: d.title ?? "Untitled",
        subtitle,
        href: d.liveUrl ?? (d.behanceId ? BEHANCE : undefined),
        img: d.ref ? imageUrl(d.ref, 700) : undefined,
      }))
  );

  // placeholder: no bim documents in Sanity yet, so borrow the dev projects
  if (lists[0].length === 0) {
    lists[0] = lists[1].map((r) => ({ ...r, subtitle: "BIM / Coordination — placeholder" }));
  }

  return <WorksView groups={groups} lists={lists} />;
}
