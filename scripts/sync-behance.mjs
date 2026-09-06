/**
 * Pull the real name and cover image off Behance into Sanity, so the works
 * page reads them from our own CDN instead of scraping behance at request
 * time (behance blocks datacenter IPs, which is why the deployed site falls
 * back to the "UI/UX Project N" placeholders).
 *
 *   node scripts/sync-behance.mjs                     # dry run, prints the diff
 *   SANITY_TOKEN=xxx node scripts/sync-behance.mjs --write
 *
 * Idempotent: a project that already has the right title and a cover image is
 * left alone, so re-running it costs one behance fetch per project and no
 * writes. Pass --force to re-upload covers that are already in place.
 */
const PROJECT_ID = "iow9ex5z";
const DATASET = "production";
const API = "2024-01-01";

const write = process.argv.includes("--write");
const force = process.argv.includes("--force");
const token = process.env.SANITY_TOKEN;

const decode = (s) =>
  s.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) =>
    e[0] === "#"
      ? String.fromCodePoint(
          e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))
        )
      : {amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " "}[e.toLowerCase()] ?? m
  );

/** the <title> is used over og:title - og:title appends the author name, and
 *  a project name can contain a dash itself */
async function behance(id) {
  const r = await fetch(`https://www.behance.net/gallery/${id}/project`, {
    headers: { "user-agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`behance ${id}: ${r.status}`);
  const html = await r.text();
  const title = html.match(/<title>([^<]*?)\s*::\s*Behance<\/title>/i)?.[1];
  const img = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1];
  if (!title || !img) throw new Error(`behance ${id}: no title/og:image in the page`);
  return { title: decode(title).trim(), img };
}

async function upload(url, name) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`cover ${url}: ${r.status}`);
  const type = r.headers.get("content-type") ?? "image/png";
  const file = `${name}.${type.split("/")[1]?.split(";")[0] ?? "png"}`;
  const up = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API}/assets/images/${DATASET}?filename=${encodeURIComponent(file)}`,
    {
      method: "POST",
      headers: { "Content-Type": type, Authorization: `Bearer ${token}` },
      body: Buffer.from(await r.arrayBuffer()),
    }
  );
  if (!up.ok) throw new Error(`upload: ${up.status} ${(await up.text()).slice(0, 200)}`);
  return (await up.json()).document._id;
}

const q = `*[_type=="project" && discipline=="uiux" && defined(behanceId)]|order(order asc)
  {_id, title, behanceId, "ref": image.asset._ref}`;
const { result: docs } = await (
  await fetch(`https://${PROJECT_ID}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(q)}`)
).json();

if (!docs?.length) {
  console.log("no ui/ux projects with a behance id");
  process.exit(0);
}

const mutations = [];

for (const d of docs) {
  let meta;
  try {
    meta = await behance(d.behanceId);
  } catch (e) {
    console.log(`! ${d._id} (${d.title}) - ${e.message}`);
    continue;
  }

  const needsCover = force || !d.ref;
  if (meta.title === d.title && !needsCover) {
    console.log(`= ${d.title}`);
    continue;
  }

  const set = {};
  if (meta.title !== d.title) {
    console.log(`~ ${d._id}.title\n    was: ${JSON.stringify(d.title)}\n    now: ${JSON.stringify(meta.title)}`);
    set.title = meta.title;
  }
  if (needsCover) {
    console.log(`~ ${d._id}.image  <- ${meta.img}`);
    if (write && token) {
      const asset = await upload(meta.img, `behance-${d.behanceId}`);
      // alt doubles as the studio's required alt text and the site's img alt
      set.image = { _type: "image", alt: meta.title, asset: { _type: "reference", _ref: asset } };
    } else {
      set.image = "<uploaded on --write>";
    }
  }
  mutations.push({ patch: { id: d._id, set } });
}

if (!mutations.length) {
  console.log("nothing to do");
} else if (!write) {
  console.log(`\ndry run - ${mutations.length} mutation(s); pass --write with SANITY_TOKEN`);
} else if (!token) {
  console.error("SANITY_TOKEN is required to write");
} else {
  const out = await fetch(`https://${PROJECT_ID}.api.sanity.io/v${API}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  console.log(out.status, (await out.text()).slice(0, 300));
}
