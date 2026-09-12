"use client";

import { useEffect, useRef, useState } from "react";
import HorizontalScroll from "./HorizontalScroll";
import ProjectList, { type Row } from "./ProjectList";
import PillNav from "../PillNav";

export type Group = {
  key: string;
  label: string;
  images: {
    src: string;
    srcSet: string;
    sizes: string;
    alt: string;
    ratio: string;
    full: string;
    title: string;
    tools: string[];
  }[];
};

const LABELS = ["3d", "BIM", "Code", "UI/UX"];
const FADE = 700; // must outlast the staggered item-out in globals.css
const ZOOM_LERP = 0.18; // same easing idea as LERP in HorizontalScroll
const ZOOM_MAX = 6;

export default function WorksView({
  groups,
  lists,
  more,
}: {
  groups: Group[];
  lists: Row[][];
  more?: string;
}) {
  const [active, setActive] = useState(0);
  const [shot, setShot] = useState<Group["images"][number] | null>(null);
  const pane = useRef<HTMLDivElement>(null);
  const imgEl = useRef<HTMLImageElement>(null);
  // the fitted size, measured once the file lands - the pixel size to multiply
  const fitSize = useRef<{ w: number; h: number } | null>(null);
  // the point of the picture to hold still (0..1 across it), and the spot on
  // screen to hold it at - the cursor
  const anchor = useRef({ fx: 0.5, fy: 0.5, cx: 0, cy: 0 });
  const [out, setOut] = useState(false); // old discipline fading away
  const [menu, setMenu] = useState(false); // collapsed into a hamburger below 1100px
  const menuRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const gallery = active === 0;

  // same deal as the drawing-set lightbox in ProjectList
  useEffect(() => {
    if (!shot) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShot(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [shot]);

  /** Wheel zooms towards the cursor, eased.
   *
   *  Deliberately no React state: a setState per wheel tick re-rendered the
   *  image and then corrected the scroll a frame later, and the two racing the
   *  next tick is what juddered. The wheel only moves a target here; one rAF
   *  loop eases towards it and writes size and scroll together in the same
   *  frame - the same LERP-and-write shape HorizontalScroll already uses, so
   *  there is nothing to install.
   */
  useEffect(() => {
    const el = pane.current;
    const im = imgEl.current;
    if (!shot || !el || !im) return;

    let cur = 1;
    let target = 1;
    let raf = 0;
    let running = false;

    const apply = () => {
      const box = fitSize.current;
      if (!box) return;
      const zoomed = cur > 1.001;
      // the fitted state is the stylesheet's job - handing it back means one
      // source of truth for how a picture sits when it is not zoomed
      im.style.cssText = zoomed
        ? `max-width:none;max-height:none;width:${box.w * cur}px;height:${box.h * cur}px`
        : "";
      el.dataset.zoom = String(zoomed);
      // Measure the picture after resizing and nudge the scroll by however far
      // the anchored point drifted from the cursor. Reading it back rather
      // than predicting it means the pane's padding and the auto margins that
      // centre it never have to be modelled - they come out in the measurement.
      const a = anchor.current;
      const r = im.getBoundingClientRect();
      el.scrollLeft += r.left + a.fx * r.width - a.cx;
      el.scrollTop += r.top + a.fy * r.height - a.cy;
    };

    const loop = () => {
      cur += (target - cur) * ZOOM_LERP;
      if (Math.abs(target - cur) < 0.002) cur = target;
      apply();
      if (cur !== target) raf = requestAnimationFrame(loop);
      else running = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.min(ZOOM_MAX, Math.max(1, target * (e.deltaY < 0 ? 1.25 : 1 / 1.25)));
      if (next === target) return;
      // re-anchor on where the picture actually sits this instant, so a second
      // notch mid-ease does not fight the first. Clamped because the cursor can
      // sit in the pane's padding, off the picture entirely.
      const r = im.getBoundingClientRect();
      const clamp = (v: number) => Math.min(1, Math.max(0, v));
      anchor.current = {
        fx: clamp((e.clientX - r.left) / r.width),
        fy: clamp((e.clientY - r.top) / r.height),
        cx: e.clientX,
        cy: e.clientY,
      };
      target = next;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    el.addEventListener("wheel", onWheel, {passive: false});
    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, [shot]);

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
                  {/* index in the key: a cover dropped into its own album
                      would otherwise collide */}
                  {group.images.map((img, i) => (
                    <figure
                      className="w-shot"
                      key={img.src + i}
                      // width follows the height, so the box has to know the
                      // shape before the file lands or the scroller jumps
                      style={{
                        aspectRatio: img.ratio,
                        // the stagger is capped so images far down the
                        // scroller are not still waiting to appear
                        ["--n" as string]: Math.min(n++, 10),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          fitSize.current = null;
                          anchor.current = {fx: 0.5, fy: 0.5, cx: 0, cy: 0};
                          setShot(img);
                        }}
                        aria-label={`View ${img.alt || img.title} full size`}
                      >
                        <img
                          src={img.src}
                          srcSet={img.srcSet}
                          sizes={img.sizes}
                          alt={img.alt}
                          loading="lazy"
                        />
                      </button>
                      {img.tools.length > 0 && (
                        <figcaption>
                          {img.tools.map((tool) => (
                            <span key={tool}>{tool}</span>
                          ))}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            ))}

            {/* the drive folder, parked at the far end of the scroller */}
            {more && (
              <section className="w-outro">
                <a href={more} target="_blank" rel="noreferrer">
                  <span>View more</span>
                  <span>
                    projects <span className="w-outro-arrow">↗</span>
                  </span>
                </a>
              </section>
            )}
          </div>
        </HorizontalScroll>
      ) : (
        <div className="works-list">
          <h1 className="works-title">WORKS</h1>
          <ProjectList rows={lists[active - 1]} />
        </div>
      )}
      </div>

      {shot && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${shot.alt || shot.title} — full size`}
          onClick={() => setShot(null)}
        >
          <div className="lightbox-bar">
            <strong>{shot.title || shot.alt}</strong>
            <a
              href={shot.full}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Open in new tab
            </a>
            <button type="button" onClick={() => setShot(null)} aria-label="Close" autoFocus>
              ✕
            </button>
          </div>
          {/* no srcset here on purpose - the whole point is the full file, and
              a srcset would let the browser pick the small one back off it.
              Clicking the picture zooms rather than dismissing; the backdrop
              dismisses, which is how the drawing-set lightbox already behaves. */}
          <div className="lightbox-img" ref={pane}>
            {/* key: a fresh element per render, so the inline size the zoom
                loop writes never carries over to the next picture */}
            <img
              key={shot.full}
              ref={imgEl}
              src={shot.full}
              alt={shot.alt}
              onClick={(e) => e.stopPropagation()}
              onLoad={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                fitSize.current = {w: r.width, h: r.height};
              }}
            />
          </div>
        </div>
      )}

      <PillNav />
    </main>
  );
}
