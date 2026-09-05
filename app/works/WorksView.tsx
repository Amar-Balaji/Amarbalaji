"use client";

import { useState } from "react";
import HorizontalScroll from "./HorizontalScroll";
import ProjectList, { type Row } from "./ProjectList";
import PillNav from "../PillNav";

export type Group = {
  key: string;
  label: string;
  images: { src: string; srcSet: string; alt: string }[];
};

const LABELS = ["3d", "BIM", "Code", "UI/UX"];

export default function WorksView({ groups, lists }: { groups: Group[]; lists: Row[][] }) {
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false); // collapsed into a hamburger below 900px
  const gallery = active === 0;

  return (
    <main className="works" data-mode={gallery ? "gallery" : "list"}>
      <button
        className="disc-toggle"
        aria-label="Disciplines"
        aria-expanded={menu}
        onClick={() => setMenu((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className="disciplines" data-open={menu}>
        {LABELS.map((label, i) => (
          <button
            key={label}
            style={{ ["--i" as string]: i }}
            data-active={i === active}
            aria-current={i === active ? "true" : undefined}
            onClick={() => {
              setActive(i);
              setMenu(false);
            }}
          >
            <span className="disc-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="disc-mask">
              <span className="disc-slide">
                <span>{label}</span>
                <span aria-hidden="true">{label}</span>
              </span>
            </span>
            <span className="disc-line" />
          </button>
        ))}
      </nav>

      {gallery ? (
        <HorizontalScroll>
          <div className="w-frame">
            <section className="w-intro">
              <h1>ALL</h1>
              <h1>WORKS</h1>
            </section>

            {groups.map((group, i) => (
              <section className="w-single" key={group.key}>
                <div className="w-tab">
                  <div className="w-tab-label">
                    <h2>{group.label}</h2>
                    <h3>{String(i + 1).padStart(2, "0")}</h3>
                  </div>
                </div>
                <div className="w-gallery">
                  {group.images.map((img) => (
                    <img
                      key={img.src}
                      src={img.src}
                      srcSet={img.srcSet}
                      sizes="(max-width: 900px) 100vw, 38vw"
                      alt={img.alt}
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </HorizontalScroll>
      ) : (
        <div className="works-list">
          <h1 className="works-title">WORKS</h1>
          <ProjectList rows={lists[active - 1]} />
        </div>
      )}

      <PillNav />
    </main>
  );
}
