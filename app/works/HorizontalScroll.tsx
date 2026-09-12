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

    // :hover is no use here. The wheel is preventDefault-ed and the gallery is
    // moved by writing el.scrollLeft, which the browser does not treat as a
    // user scroll - so it never re-runs its hit test, and the render that slid
    // under a still cursor stays unlit until the mouse twitches. So we do the
    // hit test ourselves, on every frame of the scroll as well as on movement.
    let hot: Element | null = null;
    let px = -1;
    let py = -1;

    const syncHover = () => {
      if (px < 0) return; // pointer has not been over the gallery yet
      const shot = document.elementFromPoint(px, py)?.closest(".w-shot") ?? null;
      if (shot === hot) return;
      hot?.classList.remove("is-hot");
      shot?.classList.add("is-hot");
      hot = shot;
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      syncHover();
    };

    const onLeave = () => {
      px = py = -1;
      hot?.classList.remove("is-hot");
      hot = null;
    };

    const loop = () => {
      const max = el.scrollWidth - el.clientWidth;
      target = Math.max(0, Math.min(target, max));
      el.scrollLeft += (target - el.scrollLeft) * LERP;
      syncHover();
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
    const onScroll = () => {
      if (!running) target = el.scrollLeft;
      syncHover();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      onLeave();
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
