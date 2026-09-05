"use client";

import { useEffect, useRef } from "react";
import { preloadRemaining } from "./preload";

const LAYER_GAP = 2500;
const SCROLL_SPEED = 3.5;
const LERP = 0.08;
const LAYER_COUNT = 6;
const TUNNEL_DEPTH = LAYER_COUNT * LAYER_GAP;
const VISIBLE_DEPTH = 3 * LAYER_GAP;
const EXIT = LAYER_GAP;
const INTRO_MS = 4200;
const INTRO_FROM = -(VISIBLE_DEPTH + LAYER_GAP); // every layer starts beyond the fog

function overlayFor(z: number) {
  if (z > EXIT) return 1;
  if (z > 0) return 1 - z / EXIT;
  if (z >= -VISIBLE_DEPTH) return (Math.abs(z) / VISIBLE_DEPTH) ** 2;
  return 1;
}

export default function Tunnel({
  images,
  onInteract,
}: {
  images: string[];
  onInteract?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const interact = useRef(onInteract);
  interact.current = onInteract;

  useEffect(() => {
    const layers = Array.from(
      root.current!.querySelectorAll<HTMLElement>(".layer")
    ).map((element, i) => ({ element, baseZ: -(i * LAYER_GAP) }));

    let target = 0;
    let current = 0;
    let raf = 0;
    let running = false;

    // reduced motion: place the layers once, never animate the drift
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // hold the tunnel empty until the preloader clears, then drift the images in
    const introStart = performance.now() + preloadRemaining();

    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const used = () => interact.current?.();
    const onWheel = (e: WheelEvent) => {
      target += e.deltaY * SCROLL_SPEED;
      wake();
      used();
    };

    // drag anywhere on the canvas to fly through the tunnel
    const el = root.current!;
    let dragging = false;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      target += (lastY - e.clientY) * SCROLL_SPEED * 2.5;
      lastY = e.clientY;
      wake();
      used();
    };
    const onUp = () => {
      dragging = false;
      el.style.cursor = "grab";
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    const tick = (now: number) => {
      current += (target - current) * LERP;

      // eased drift from far beyond the fog to the resting depth
      const t = still ? 1 : Math.min(1, Math.max(0, (now - introStart) / INTRO_MS));
      const intro = INTRO_FROM * (1 - t) ** 3;

      for (const { element, baseZ } of layers) {
        let z = ((baseZ + current + EXIT) % TUNNEL_DEPTH) - EXIT;
        if (z < -TUNNEL_DEPTH + EXIT) z += TUNNEL_DEPTH;
        z += intro; // added after the wrap, or the loop pulls layers back into view
        element.style.transform = `translateZ(${z}px)`;
        const o = overlayFor(z);
        element.style.setProperty("--overlay", String(o));
        element.style.visibility = o >= 0.99 ? "hidden" : "visible";
      }
      // idle: the intro has landed and the scroll has caught up, so there is
      // nothing left to repaint until the next input
      if (t >= 1 && Math.abs(target - current) < 0.5) {
        current = target;
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    running = true;
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <section className="spotlight" ref={root}>
      <div className="tunnel">
        {Array.from({ length: LAYER_COUNT }, (_, i) => (
          <div className="layer" key={i}>
            {Array.from({ length: 4 }, (_, j) => (
              <div className="item" key={j}>
                {/* plain img: sources are remote and swap on filter change */}
                <img src={images[(i * 4 + j) % images.length]} alt="" />
                <div className="item-overlay" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
