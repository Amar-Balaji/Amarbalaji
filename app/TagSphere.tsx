"use client";

import { useEffect, useRef } from "react";

const IDLE_SPEED = 0.0022;
const DRAG_SPEED = 0.006; // rad per pixel dragged - a full sweep is about half a turn
const FRICTION = 0.94;

export default function TagSphere({
  words,
  active,
  onHover,
}: {
  words: string[];
  active: string | null;
  onHover: (key: string | null) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const hovered = useRef<string | null>(null);
  const report = useRef(onHover);

  // read by the animation loop without re-running the effect
  paused.current = active !== null;
  report.current = onHover;
  hovered.current = active;

  useEffect(() => {
    const el = root.current!;
    const tags = Array.from(el.querySelectorAll<HTMLElement>(".tag"));
    const n = tags.length;

    // even distribution on a sphere (golden spiral)
    const points = tags.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i + 1) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      return [
        Math.cos(theta) * Math.sin(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(phi),
      ];
    });

    let rx = 0.25;
    let ry = 0;
    let vx = 0;
    let vy = IDLE_SPEED;
    let radius = 0;

    const resize = () => {
      radius = Math.min(el.clientWidth, el.clientHeight) / 2 - 30;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let dragging = false;
    let moved = 0;
    let last = { x: 0, y: 0 };
    let pointer: { x: number; y: number } | null = null;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      last = { x: e.clientX, y: e.clientY };
      vx = 0;
      vy = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      vy = dx * DRAG_SPEED;
      vx = -dy * DRAG_SPEED;
      rx += vx;
      ry += vy;
      last = { x: e.clientX, y: e.clientY };
    };

    const onUp = () => {
      dragging = false;
      el.style.cursor = "grab";
    };

    const onLeave = () => {
      pointer = null;
      if (hovered.current !== null) report.current(null);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => {
      if (!dragging) {
        // decay to the idle spin, or to a standstill while a skill is hovered
        const idle = paused.current || still ? 0 : IDLE_SPEED;
        vy = idle + (vy - idle) * FRICTION;
        vx *= FRICTION;
        rx += vx;
        ry += vy;
      }

      const [sx, cx] = [Math.sin(rx), Math.cos(rx)];
      const [sy, cy] = [Math.sin(ry), Math.cos(ry)];

      tags.forEach((tag, i) => {
        const [px, py, pz] = points[i];
        const x = px * cy + pz * sy;
        const z1 = pz * cy - px * sy;
        const y = py * cx + z1 * sx;
        const z = z1 * cx - py * sx;

        const depth = (z + 1) / 2; // 0 = far, 1 = near
        const scale = 0.55 + depth * 0.75;
        tag.style.transform = `translate3d(${x * radius}px, ${y * radius}px, 0) scale(${scale}) translate(-50%, -50%)`;
        tag.style.opacity = String(0.2 + depth * 0.8);
        tag.style.zIndex = String(Math.round(depth * 100));
      });

      // ponytail: hit-test from the last pointer position every frame - pointerenter
      // alone misses tags that drift under a cursor that is standing still.
      if (pointer && !dragging) {
        const hit = document
          .elementFromPoint(pointer.x, pointer.y)
          ?.closest<HTMLElement>(".tag");
        const next = hit?.dataset.key ?? null;
        if (next !== hovered.current) report.current(next);
      }

      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [words]);

  return (
    <div className="sphere" ref={root}>
      {words.map((w) => (
        <span className="tag" key={w} data-key={key(w)} data-active={key(w) === active}>
          {w}
        </span>
      ))}
    </div>
  );
}

const ALIASES: Record<string, string> = { js: "javascript", weavyai: "weavy" };

/** loose match so "V-Ray Render" in the cloud lines up with the "V-Ray" chip */
export function key(label: string) {
  const k = label.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/render$/, "");
  return ALIASES[k] ?? k;
}
