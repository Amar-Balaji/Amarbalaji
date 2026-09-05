/**
 * Bring every Sanity section in line with what the site renders.
 *
 *   node scripts/sync-content.mjs                    # dry run, prints the diff
 *   SANITY_TOKEN=xxx node scripts/sync-content.mjs --write
 *
 * PATCH      - update fields on documents that already exist
 * REPLACE    - create or overwrite documents this file owns (fixed ids)
 * PRUNE_TYPE - delete documents of a type that REPLACE did not claim
 */
const PROJECT_ID = "iow9ex5z";
const DATASET = "production";
const API = "2024-01-01";

/* ---------------------------------------------------------------- hero */
const HERO = {
  roles: ["Bim Modeler", "3d Visualiser", "Ui/Ux Designer"],
  bio:
    "Experienced 3D Architectural Visualizer with 6.5 years of proven expertise in " +
    "bringing architectural visions to life. Proficient in creating realistic and " +
    "captivating visualizations, adept at collaborating with design teams to exceed " +
    "client expectations. Skilled in the latest software tools and dedicated to " +
    "continuous growth in the field.",
};

/* ------------------------------------------------------------ settings */
const SETTINGS = {
  seoTitle: "Amar Balaji - Bim Modeler, 3d Visualiser & Ui/Ux Designer",
  // the studio caps this at 160 characters
  seoDescription:
    "3D architectural visualisation, BIM coordination and UI/UX design. " +
    "6.5 years of photorealistic renders for residential and commercial " +
    "projects. Bangalore.",
};

/* ------------------------------------------------------------- contact */
const CONTACT = {
  availability: "Open for freelance opportunities",
  copyright: "Amar Balaji",
  credit: "Designed and developed by Amar Balaji",
  socials: [
    { _key: "artstation", label: "ArtStation", href: "https://www.artstation.com/amarbalajii" },
    { _key: "behance", label: "Behance", href: "https://www.behance.net/amar_balaji" },
    { _key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/amar-balaji-203620147" },
  ],
};

/* fields no page renders - cleared so the studio stops asking for them */
const UNSET = [
  { id: "hero", fields: ["greeting"] },
  { id: "siteSettings", fields: ["ogImage"] },
  { id: "contact", fields: ["heading"] },
];

/* --------------------------------------------------- skills (rebuilt) */
// four columns, matching the about page: the sphere is the union of these
const SKILL_GROUPS = [
  { _id: "skill-bim", title: "Bim", order: 0, items: ["Revit", "Dynamo", "PyRevit"] },
  {
    _id: "skill-3d",
    title: "3d",
    order: 1,
    items: [
      "3ds Max", "V-Ray Render", "Corona Render", "Unreal Engine",
      "Lumion", "SketchUp", "Railclone", "Forest Pack", "AutoCAD",
    ],
  },
  { _id: "skill-design", title: "Design", order: 2, items: ["Figma", "Photoshop"] },
  { _id: "skill-languages", title: "Languages", order: 3, items: ["Html", "Css", "JavaScript", "Python"] },
  { _id: "skill-ai", title: "AI", order: 4, items: ["ComfyUI", "Weavy AI"] },
].map((g) => ({ ...g, _type: "skillGroup" }));

/* -------------------------------------------- experience ordering + Keus */
// existing ids in the dataset, reordered to make room for the Keus role
const EXPERIENCE_ORDER = {
  e1l2a0ZImsy1LdNo9dxQ98: 0, // Ashley GCC
  e1l2a0ZImsy1LdNo9dxQA7: 2, // Zyeta
  e1l2a0ZImsy1LdNo9dxQB6: 3, // ARCHJS
  e1l2a0ZImsy1LdNo9dxQC5: 4, // Jawahar
  e1l2a0ZImsy1LdNo9dxQD4: 5, // B.E
  e1l2a0ZImsy1LdNo9dxQE3: 6, // Diploma
};

const KEUS = {
  _id: "exp-keus",
  _type: "experienceEntry",
  kind: "experience",
  order: 1,
  title: "Keus Home Automation Pvt Ltd",
  subtitle: "3D Visualiser",
  period: "July 2024 - Dec 2025",
  location: "Hyderabad, India",
  detail:
    "Executed detailed 3D modeling, rendering, and animation tasks for complex " +
    "architectural projects, working closely with design teams to ensure visuals " +
    "accurately represented project goals and maintained consistency with client " +
    "expectations.",
};

const PATCH = [
  { id: "hero", set: HERO },
  { id: "siteSettings", set: SETTINGS },
  { id: "contact", set: CONTACT },
  ...Object.entries(EXPERIENCE_ORDER).map(([id, order]) => ({ id, set: { order } })),
];
const REPLACE = [...SKILL_GROUPS, KEUS];
const PRUNE_TYPE = ["skillGroup"]; // the three old groups are replaced by the five above

/* ---------------------------------------------------------------- run */
const write = process.argv.includes("--write");
const token = process.env.SANITY_TOKEN;

const q = async (query) => {
  const r = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(query)}`
  );
  return (await r.json()).result;
};

const ids = PATCH.map((p) => p.id);
const existing = Object.fromEntries((await q(`*[_id in ${JSON.stringify(ids)}]`)).map((d) => [d._id, d]));

const mutations = [];

for (const { id, set } of PATCH) {
  const doc = existing[id];
  if (!doc) { console.log(`! ${id} not found - skipped`); continue; }
  const changed = {};
  for (const [f, v] of Object.entries(set)) {
    if (JSON.stringify(doc[f]) !== JSON.stringify(v)) changed[f] = v;
  }
  if (!Object.keys(changed).length) continue;
  for (const [f, v] of Object.entries(changed))
    console.log(`~ ${id}.${f}\n    was: ${JSON.stringify(doc[f])}\n    now: ${JSON.stringify(v)}`);
  mutations.push({ patch: { id, set: changed } });
}

for (const { id, fields } of UNSET) {
  const doc = existing[id];
  const present = fields.filter((f) => doc?.[f] !== undefined);
  if (!present.length) continue;
  present.forEach((f) => console.log(`x ${id}.${f} (unused - clearing ${JSON.stringify(doc[f])})`));
  mutations.push({ patch: { id, unset: present } });
}

for (const doc of REPLACE) {
  console.log(`+ ${doc._type} ${doc._id} (${doc.title})`);
  mutations.push({ createOrReplace: doc });
}

const owned = new Set(REPLACE.map((d) => d._id));
for (const type of PRUNE_TYPE) {
  for (const doc of await q(`*[_type=="${type}"]{_id, title}`)) {
    if (owned.has(doc._id)) continue;
    console.log(`- ${type} ${doc._id} (${doc.title})`);
    mutations.push({ delete: { id: doc._id } });
  }
}

if (!mutations.length) {
  console.log("nothing to do");
} else if (!write) {
  console.log(`\ndry run - ${mutations.length} mutation(s); pass --write with SANITY_TOKEN`);
} else if (!token) {
  console.error("SANITY_TOKEN is required to write");
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
