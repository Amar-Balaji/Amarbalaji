/**
 * Trim the project documents down to the images the site actually shows.
 *
 *   node scripts/prune-projects.mjs              # dry run, prints what would go
 *   SANITY_TOKEN=xxx node scripts/prune-projects.mjs --delete
 *
 * Keeps the newest-ordered N per 3D category plus every non-3D project,
 * and deletes the rest along with their uploaded image assets.
 */
const PROJECT_ID = "iow9ex5z";
const DATASET = "production";
const API = "2024-01-01";

// 12 + 6 + 6 + 9 + 2 = 35 images
const KEEP = { frontpage: 12, residential: 6, commercial: 6, workspace: 9, other: 0 };

const doDelete = process.argv.includes("--delete");
const token = process.env.SANITY_TOKEN;

const query = `*[_type=="project"]|order(order asc, _createdAt asc)
  {_id, title, category, discipline, "ref": image.asset._ref}`;

const res = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(query)}`
);
const { result: docs } = await res.json();

const seen = {};
const keep = [];
const drop = [];

for (const d of docs) {
  if (d.discipline !== "3d") { keep.push(d); continue; }  // bim / code / ui-ux stay
  const cap = KEEP[d.category] ?? 0;
  seen[d.category] = (seen[d.category] ?? 0) + 1;
  (seen[d.category] <= cap ? keep : drop).push(d);
}

console.log(`keeping ${keep.length}, deleting ${drop.length} of ${docs.length}`);
for (const [cat, n] of Object.entries(KEEP)) {
  console.log(`  ${cat.padEnd(12)} keep ${Math.min(n, seen[cat] ?? 0)} of ${seen[cat] ?? 0}`);
}

if (!doDelete) {
  console.log("dry run - pass --delete with SANITY_TOKEN set to apply");
} else if (!token) {
  console.error("SANITY_TOKEN is required to delete");
} else {

  const mutate = async (mutations) => {
    const r = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v${API}/data/mutate/${DATASET}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mutations }),
      }
    );
    return `${r.status} ${(await r.text()).slice(0, 200)}`;
  };

  // published docs and their drafts go first - a draft still holding a
  // reference blocks the asset delete and rolls the whole transaction back
  const docs = drop.flatMap((d) => [
    { delete: { id: d._id } },
    { delete: { id: `drafts.${d._id}` } },
  ]);
  console.log("documents:", await mutate(docs));

  // then only the assets nothing points at any more
  const candidates = [...new Set(drop.map((d) => d.ref).filter(Boolean))];
  const orphanQuery = `*[_id in ${JSON.stringify(candidates)} && count(*[references(^._id)]) == 0]._id`;
  const orphans = await (
    await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(orphanQuery)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  ).json();
  const assetIds = orphans.result ?? [];
  console.log(`assets: ${assetIds.length} of ${candidates.length} now unreferenced`);
  if (assetIds.length) {
    console.log("assets:", await mutate(assetIds.map((id) => ({ delete: { id } }))));
  }
}
