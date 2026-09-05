"use client";

import { useEffect, useRef } from "react";

const LERP = 0.1;

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(max-width: 900px)").matches) return; // stacks vertically below this

    let target = el.scrollLeft;
    let running = false;

    const loop = () => {
      const max = el.scrollWidth - el.clientWidth;
      target = Math.max(0, Math.min(target, max));
      el.scrollLeft += (target - el.scrollLeft) * LERP;
      if (Math.abs(target - el.scrollLeft) > 0.5) requestAnimationFrame(loop);
      else running = false;
    };

    // map vertical wheel onto horizontal travel, eased
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // real trackpad pan: leave it native
      e.preventDefault();
      target += e.deltaY;
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    };

    // keep in sync when the scroll comes from elsewhere (touch, scrollbar, keyboard)
    const onScroll = () => { if (!running) target = el.scrollLeft; };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    // tabIndex: the gallery holds no focusable children, so without this the
    // whole scroller is unreachable by keyboard in Chrome
    <div className="hscroll" ref={ref} tabIndex={0} role="region" aria-label="Works gallery">
      {children}
    </div>
  );
}
