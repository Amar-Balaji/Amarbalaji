"use client";

import { useMemo, useState } from "react";
import TagSphere, { key } from "../TagSphere";
import PillNav from "../PillNav";
import MaskedText from "./MaskedText";

export type Group = { title: string; items: string[] };
export type Job = {
  period: string;
  place: string;
  role: string;
  company: string;
  body: string;
};

export type Hero = {
  name: string;
  roles: string[];
  bio: string;
  portrait?: string;
  portraitAlt?: string;
};

export default function AboutView({
  hero,
  resume,
  groups,
  experience,
  education,
}: {
  hero: Hero;
  resume: string;
  groups: Group[];
  experience: Job[];
  education: Job[];
}) {
  const [active, setActive] = useState<string | null>(null);
  // only a chip hover turns the sphere; hovering a tag on the sphere just highlights
  const [focus, setFocus] = useState<string | null>(null);
  // the sphere shows every skill in the panel, deduped. memoised because a new
  // array on every hover would tear down and restart the sphere's render loop
  const cloud = useMemo(
    () => Array.from(new Set(groups.flatMap((g) => g.items))),
    [groups]
  );

  return (
    <main className="about">
      <header className="topbar">
        <a href="/" className="logo">AB</a>
        {/* the Sanity upload if there is one, else the bundled cv.pdf */}
        <a className="resume" href={resume} target="_blank" rel="noreferrer">
          Resume
        </a>
      </header>

      <section className="intro">
        <div>
          <h1>{hero.name}</h1>
          <p className="role">{hero.roles.join(" - ")}</p>
          <MaskedText text={hero.bio} />
        </div>
        {hero.portrait ? (
          // the portrait is hidden below 900px - display:none still downloads an
          // <img src>, so the real file hangs off a media source and the fallback
          // src is an inline pixel that costs no request
          <picture className="portrait">
            <source media="(min-width: 901px)" srcSet={hero.portrait} />
            <img
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              alt={hero.portraitAlt ?? hero.name}
            />
          </picture>
        ) : (
          <div className="portrait" aria-hidden="true" />
        )}
      </section>

      <section className="skills">
        <h2>Skills</h2>
        <div className="skills-grid">
          <TagSphere words={cloud} active={active} focus={focus} onHover={setActive} />

          <div className="skill-groups">
            {groups.map((g) => (
              <div key={g.title}>
                <h3>{g.title}</h3>
                <div className="chips">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="chip"
                      data-active={key(item) === active}
                      onPointerEnter={() => {
                        setActive(key(item));
                        setFocus(key(item));
                      }}
                      onPointerLeave={() => {
                        setActive(null);
                        setFocus(null);
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="experience">
        <h2>Experience</h2>
        {experience.map((job) => (
          <article key={job.period + job.company}>
            <div>
              <p className="period">{job.period}</p>
              <p className="place">{job.place}</p>
            </div>
            <div>
              <p className="job-role">{job.role}</p>
              <p className="company">{job.company}</p>
            </div>
            <p className="job-body">{job.body}</p>
          </article>
        ))}
      </section>

      {education.length > 0 && (
        <section className="experience">
          <h2>Education</h2>
          {education.map((item) => (
            <article key={item.period + item.company}>
              <div>
                <p className="period">{item.period}</p>
                <p className="place">{item.place}</p>
              </div>
              <div>
                <p className="job-role">{item.role}</p>
                <p className="company">{item.company}</p>
              </div>
              <p className="job-body">{item.body}</p>
            </article>
          ))}
        </section>
      )}

      <PillNav />
    </main>
  );
}
