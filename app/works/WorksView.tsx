"use client";

import { useEffect, useRef, useState } from "react";
import HorizontalScroll from "./HorizontalScroll";
import ProjectList, { type Row } from "./ProjectList";
import PillNav from "../PillNav";

export type Group = {
  key: string;
  label: string;
  images: { src: string; srcSet: string; alt: string; ratio: string }[];
};

const LABELS = ["3d", "BIM", "Code", "UI/UX"];
const FADE = 700; // must outlast the staggered item-out in globals.css

export default function WorksView({ groups, lists }: { groups: Group[]; lists: Row[][] }) {
  const [active, setActive] = useState(0);
  const [out, setOut] = useState(false); // old discipline fading away
  const [menu, setMenu] = useState(false); // collapsed into a hamburger below 1100px
  const menuRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const gallery = active === 0;

  // on tablet this menu is the only way to change discipline, so it has to be
  // dismissable the two ways people expect
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // fade the current discipline out first, then swap - the incoming items
  // stagger themselves in via the remount (key={active})
  const go = (i: number) => {
    setMenu(false);
    if (i === active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(i);
      return;
    }
    setOut(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setActive(i);
      setOut(false);
    }, FADE);
  };

  let n = 0; // running index across every gallery image, drives the stagger

  return (
    <main className="works" data-mode={gallery ? "gallery" : "list"}>
      <div ref={menuRef}>
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
            onClick={() => go(i)}
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
      </div>

      <div className="works-body" key={active} data-out={out}>
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
                      sizes="(max-width: 900px) 100vw, 45vw"
                      alt={img.alt}
                      loading="lazy"
                      // width follows the height, so the box has to know the
                      // shape before the file lands or the scroller jumps
                      style={{
                        aspectRatio: img.ratio,
                        // the stagger is capped so images far down the
                        // scroller are not still waiting to appear
                        ["--n" as string]: Math.min(n++, 10),
                      }}
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
      </div>

      <PillNav />
    </main>
  );
}
