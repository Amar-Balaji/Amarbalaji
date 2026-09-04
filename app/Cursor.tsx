"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, input, textarea, .tag, .chip, .project-item";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // pointer devices only - never on touch
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = dot.current!;
    el.dataset.on = "true";

    let mx = -200, my = -200, x = mx, y = my;

    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      el.dataset.big = String(!!t?.closest?.(INTERACTIVE));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);

    let raf = 0;
    const tick = () => {
      x += (mx - x) * 0.2;
      y += (my - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return <div className="dot-cursor" ref={dot} />;
}
