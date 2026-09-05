import AboutView, { type Group, type Hero, type Job } from "./AboutView";
import { sanityFetch, imageUrl, fileUrl } from "../../lib/sanity";

export const revalidate = 60;

export const metadata = {
  title: "About",
  description: "Bim modeler, 3d visualiser and ui/ux designer based in Bangalore.",
};

type Data = {
  hero?: { name?: string; roles?: string[]; bio?: string; ref?: string; alt?: string };
  groups?: Group[];
  resume?: string;
  experience?: Job[];
  education?: Job[];
};

const QUERY = `{
  "hero": *[_type=="hero"][0]{name, roles, bio, "ref": portrait.asset._ref, "alt": portrait.alt},
  "resume": *[_type=="siteSettings"][0].resume.asset._ref,
  "groups": *[_type=="skillGroup"]|order(order asc){title, items},
  "experience": *[_type=="experienceEntry" && kind=="experience"]|order(order asc){
    period, "place": location, "role": subtitle, "company": title, "body": detail
  },
  "education": *[_type=="experienceEntry" && kind=="education"]|order(order asc){
    period, "place": location, "role": subtitle, "company": title, "body": detail
  }
}`;

export default async function About() {
  const data = await sanityFetch<Data>(QUERY);

  const hero: Hero = {
    name: (data?.hero?.name ?? "Amar Balaji").toUpperCase(),
    roles: data?.hero?.roles ?? [],
    bio: data?.hero?.bio ?? "",
    portrait: data?.hero?.ref ? imageUrl(data.hero.ref, 900) : undefined,
    portraitAlt: data?.hero?.alt,
  };

  const resume = data?.resume ? fileUrl(data.resume) : "/cv.pdf";

  return (
    <AboutView
      resume={resume}
      hero={hero}
      groups={data?.groups ?? []}
      experience={data?.experience ?? []}
      education={data?.education ?? []}
    />
  );
}
