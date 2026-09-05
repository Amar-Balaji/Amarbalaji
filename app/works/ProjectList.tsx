"use client";

import { useEffect, useRef, useState } from "react";

export type Row = {
  title: string;
  subtitle: string;
  href?: string;
  img?: string;
};

export default function ProjectList({ rows }: { rows: Row[] }) {
  const reveal = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<Row | null>(null);

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
          const Tag = row.href ? "a" : "div";
          return (
            <Tag
              className="project-item"
              key={row.title + i}
              {...(row.href ? { href: row.href, target: "_blank", rel: "noreferrer" } : {})}
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
