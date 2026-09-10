/**
 * One-off: turn the old hardcoded `category` strings into renderFolder
 * documents, and repoint every 3D render at one.
 *
 *   node scripts/migrate-folders.mjs                     # dry run, prints the diff
 *   SANITY_TOKEN=xxx node scripts/migrate-folders.mjs --write
 *
 * Idempotent - folders are created at fixed ids and a render already pointing
 * at a reference is skipped, so re-running it does nothing.
 */
const PROJECT_ID = "iow9ex5z";
const DATASET = "production";
const API = "2024-01-01";

const write = process.argv.includes("--write");
const token = process.env.SANITY_TOKEN;

/** The five folders as they were, in works-page order. The title is now the
 *  heading visitors read, so these are the site's labels, not the Studio's
 *  longer ones. Rename any of them in the Studio afterwards. */
const SEED = [
  { slug: "frontpage", title: "Selected", order: 10 },
  { slug: "residential", title: "Residential", order: 20 },
  { slug: "commercial", title: "Commercial", order: 30 },
  { slug: "workspace", title: "Workspace", order: 40 },
  { slug: "other", title: "Other", order: 50 },
];
const folderId = (slug) => `renderFolder-${slug}`;

const q = `*[_type=="project" && discipline=="3d"]{_id, title, category}`;
const { result: docs } = await (
  await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(q)}`
  )
).json();

if (!docs?.length) {
  console.log("no 3d projects");
  process.exit(0);
}

const mutations = [];

// createIfNotExists, so a folder already renamed in the Studio is left alone
for (const f of SEED) {
  console.log(`+ folder ${folderId(f.slug)}  "${f.title}"  #${f.order}`);
  mutations.push({
    createIfNotExists: {
      _id: folderId(f.slug),
      _type: "renderFolder",
      title: f.title,
      slug: { _type: "slug", current: f.slug },
      order: f.order,
    },
  });
}

const known = new Set(SEED.map((f) => f.slug));
let skipped = 0;

for (const d of docs) {
  // already a reference - nothing to do
  if (d.category && typeof d.category === "object") {
    skipped++;
    continue;
  }
  // an untagged render was shown under "Other" in the old Studio; keep it there
  const slug = d.category ?? "other";
  if (!known.has(slug)) {
    console.log(`! ${d._id} (${d.title}) - unknown category ${JSON.stringify(slug)}, left alone`);
    continue;
  }
  console.log(`~ ${d._id} (${d.title})  ${JSON.stringify(d.category ?? null)} -> ${slug}`);
  mutations.push({
    patch: {
      id: d._id,
      set: { category: { _type: "reference", _ref: folderId(slug) } },
    },
  });
}

if (skipped) console.log(`= ${skipped} render(s) already migrated`);

if (!write) {
  console.log(`\ndry run - ${mutations.length} mutation(s); pass --write with SANITY_TOKEN`);
} else if (!token) {
  console.error("SANITY_TOKEN is required to write");
  process.exit(1);
} else {
  const out = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API}/data/mutate/${DATASET}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mutations }),
    }
  );
  console.log(out.status, (await out.text()).slice(0, 300));
}
