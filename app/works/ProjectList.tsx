"use client";

import { useEffect, useRef, useState } from "react";

export type Row = {
  title: string;
  subtitle: string;
  href?: string;
  img?: string;
  /** A BIM drawing set. Takes precedence over href - the row opens the
   *  document in a lightbox rather than navigating away. */
  pdf?: string;
};

export default function ProjectList({ rows }: { rows: Row[] }) {
  const reveal = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<Row | null>(null);
  const [open, setOpen] = useState<Row | null>(null);

  // escape closes it, and the page behind must not scroll while it is up
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    // pointer devices only - no fake cursor on touch screens
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mx = -200, my = -200;
    let rx = mx, ry = my;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      rx += (mx - rx) * 0.09; // the image trails behind the cursor
      ry += (my - ry) * 0.09;
      if (reveal.current)
        reveal.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (rows.length === 0) {
    return <p className="empty">Nothing published here yet.</p>;
  }

  return (
    <>
      <div className="project-list">
        {rows.map((row, i) => {
          const Tag = row.pdf ? "button" : row.href ? "a" : "div";
          return (
            <Tag
              className="project-item"
              key={row.title + i}
              style={{ ["--n" as string]: Math.min(i, 10) }}
              {...(row.pdf
                ? { type: "button" as const, onClick: () => setOpen(row) }
                : row.href
                  ? { href: row.href, target: "_blank", rel: "noreferrer" }
                  : {})}
              onMouseEnter={() => setPreview(row)}
              onMouseLeave={() => setPreview(null)}
            >
              <span className="p-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="p-info">
                <h2>{row.title}</h2>
                <p>{row.subtitle}</p>
              </div>
              <span className="p-arrow">→</span>
            </Tag>
          );
        })}
      </div>

      {open?.pdf && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.title} — drawing set`}
          onClick={() => setOpen(null)}
        >
          <div className="lightbox-bar">
            <strong>{open.title}</strong>
            <a href={open.pdf} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
              Open in new tab
            </a>
            <button type="button" onClick={() => setOpen(null)} aria-label="Close" autoFocus>
              ✕
            </button>
          </div>
          {/* the browser's own pdf viewer - nothing to bundle */}
          <iframe src={open.pdf} title={`${open.title} — drawing set`} />
        </div>
      )}

      <div className="hover-reveal" ref={reveal} data-on={!!preview}>
        {preview?.img ? (
          <img src={preview.img} alt="" />
        ) : (
          // no cover in Sanity yet - keep the interaction alive with a type card
          <div className="reveal-card">
            <span>{preview?.subtitle}</span>
            <strong>{preview?.title}</strong>
          </div>
        )}
      </div>
    </>
  );
}
