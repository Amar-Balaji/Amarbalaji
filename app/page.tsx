import Hero from "./Hero";
import { sanityFetch, imageUrl, SHOTS_QUERY, type Shot } from "../lib/sanity";

export const revalidate = 60;

export default async function Home() {
  const shots = await sanityFetch<Shot[]>(SHOTS_QUERY);
  const frontpage = shots.filter((s) => s.category === "frontpage");
  const images = (frontpage.length ? frontpage : shots).map((s) => imageUrl(s.ref, 600));

  return <Hero images={images} />;
}
