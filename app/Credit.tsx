import { sanityFetch } from "../lib/sanity";

type Data = { copyright?: string; credit?: string };

export default async function Credit() {
  const c = await sanityFetch<Data>(`*[_type=="contact"][0]{copyright, credit}`);
  if (!c?.copyright && !c?.credit) return null;

  return (
    <footer className="credit">
      {c.copyright && <span>© {new Date().getFullYear()} {c.copyright}</span>}
      {c.credit && <span>{c.credit}</span>}
    </footer>
  );
}
