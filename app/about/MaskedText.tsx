"use client";

import { useEffect, useRef } from "react";

const OPEN = 200; // circle diameter while the cursor is over the text

export default function MaskedText({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = root.current!;
    const m = layer.current!;

    let tx = 0, ty = 0, ts = 0; // targets
    let x = 0, y = 0, s = 0;    // eased values

    const onMove = (e: MouseEvent) => {
      const r = m.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const onEnter = () => { ts = OPEN; };
    const onLeave = () => { ts = 0; };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      s += (ts - s) * 0.12;
      const pos = `${x - s / 2}px ${y - s / 2}px`;
      m.style.maskSize = m.style.webkitMaskSize = `${s}px`;
      m.style.maskPosition = m.style.webkitMaskPosition = pos;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="masked" ref={root}>
      <p className="bio">{text}</p>
      <p className="bio mask-layer" ref={layer} aria-hidden="true">{text}</p>
    </div>
  );
}
