"use client";

import { useEffect, useMemo, useRef } from "react";

const IDLE_SPEED = 0.0022;
const DRAG_SPEED = 0.006; // rad per pixel dragged - a full sweep is about half a turn
const FRICTION = 0.94;
const FOCUS_EASE = 0.11; // how hard the sphere is pulled toward a focused tag
const NEIGHBOURS = 3; // strands per skill - enough to read as a mesh, not a ball of wool

/** the golden-spiral points, plus the web joining each one to its nearest
 *  neighbours. Both only depend on how many skills there are. */
function mesh(n: number) {
  const points = Array.from({ length: n }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / n);
    const theta = Math.sqrt(n * Math.PI) * phi;
    return [
      Math.cos(theta) * Math.sin(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(phi),
    ];
  });

  // on a unit sphere the largest dot product is the closest point
  const edges: number[][] = [];
  const seen = new Set<string>();
  points.forEach((p, i) => {
    points
      .map((q, j) => [j, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]] as const)
      .filter(([j]) => j !== i)
      .sort((a, b) => b[1] - a[1])
      .slice(0, NEIGHBOURS)
      .forEach(([j]) => {
        const id = i < j ? `${i}:${j}` : `${j}:${i}`;
        if (seen.has(id)) return;
        seen.add(id);
        edges.push([i, j]);
      });
  });

  // the point halfway along the sphere's surface between the two ends. A
  // straight line between them would cut through the sphere and read as a
  // polygon edge; bending each strand through this instead keeps it on the
  // surface. Normalising the sum of two unit vectors gives exactly that point.
  const mids = edges.map(([i, j]) => {
    const m = points[i].map((v, k) => v + points[j][k]);
    const len = Math.hypot(...m);
    return m.map((v) => v / len);
  });

  return { points, edges, mids };
}

export default function TagSphere({
  words,
  active,
  focus,
  onHover,
}: {
  words: string[];
  active: string | null;
  /** set only while a chip in the list is hovered - the sphere turns that tag
   *  to the front. Hovering a tag on the sphere itself must not do this, or the
   *  tag would slide out from under the cursor. */
  focus: string | null;
  onHover: (key: string | null) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const hovered = useRef<string | null>(null);
  const target = useRef<string | null>(null);
  const report = useRef(onHover);

  // read by the animation loop without re-running the effect
  paused.current = active !== null;
  report.current = onHover;
  hovered.current = active;
  target.current = focus;

  const { points, edges, mids } = useMemo(() => mesh(words.length), [words.length]);

  useEffect(() => {
    const el = root.current!;
    const tags = Array.from(el.querySelectorAll<HTMLElement>(".tag"));
    const strands = Array.from(el.querySelectorAll<SVGGElement>(".strand")).map((g) => ({
      g,
      wire: g.querySelector<SVGPathElement>(".wire")!,
      pulse: g.querySelector<SVGPathElement>(".pulse")!,
    }));

    let rx = 0.25;
    let ry = 0;
    let vx = 0;
    let vy = IDLE_SPEED;
    let radius = 0;
    let cx = 0;
    let cy = 0;

    const resize = () => {
      cx = el.clientWidth / 2;
      cy = el.clientHeight / 2;
      // the inset leaves room for the widest label to sit past the equator
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

    // the angles that put a point at the front of the sphere: spin it onto the
    // xz plane's near side, then tilt it down to the equator
    const face = (p: number[]) => ({
      ry: Math.atan2(-p[0], p[2]),
      rx: Math.atan2(-p[1], Math.hypot(p[0], p[2])),
    });
    // shortest way round to an angle, so it never takes the long way
    const toward = (from: number, to: number) =>
      from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * FOCUS_EASE;

    const tick = () => {
      // a chip is hovered: turn that tag to the front instead of spinning
      const focused = target.current
        ? tags.findIndex((t) => t.dataset.key === target.current)
        : -1;
      if (focused >= 0 && !dragging && !still) {
        const { rx: tx, ry: ty } = face(points[focused]);
        rx = toward(rx, tx);
        ry = toward(ry, ty);
        vx = 0;
        vy = 0;
      } else if (!dragging) {
        // decay to the idle spin, or to a standstill while a skill is hovered
        const idle = paused.current || still ? 0 : IDLE_SPEED;
        vy = idle + (vy - idle) * FRICTION;
        vx *= FRICTION;
        rx += vx;
        ry += vy;
      }

      const [sxr, cxr] = [Math.sin(rx), Math.cos(rx)];
      const [syr, cyr] = [Math.sin(ry), Math.cos(ry)];

      /** spin a point on the unit sphere into [screen x, screen y, depth],
       *  where depth runs 0 at the back to 1 at the front */
      const project = (p: number[]) => {
        const x = p[0] * cyr + p[2] * syr;
        const z1 = p[2] * cyr - p[0] * syr;
        const y = p[1] * cxr + z1 * sxr;
        const z = z1 * cxr - p[1] * sxr;
        return [cx + x * radius, cy + y * radius, (z + 1) / 2];
      };

      const screen = points.map(project);

      tags.forEach((tag, i) => {
        const [x, y, depth] = screen[i];
        const scale = 0.55 + depth * 0.75;
        tag.style.transform = `translate3d(${x - cx}px, ${y - cy}px, 0) scale(${scale}) translate(-50%, -50%)`;
        tag.style.opacity = String(0.2 + depth * 0.8);
        tag.style.zIndex = String(Math.round(depth * 100));
      });

      // Each strand is a quadratic bend through the projected surface midpoint.
      // A quadratic passes through (P0 + 2C + P2)/4 at its halfway point, so
      // solving that for C puts the curve exactly on the sphere's surface at
      // the middle - close enough over a short hop that the web reads as round.
      strands.forEach(({ g, wire, pulse }, i) => {
        const [a, b] = edges[i];
        const [x1, y1, da] = screen[a];
        const [x2, y2, db] = screen[b];
        const [mx, my] = project(mids[i]);
        const d = `M${x1} ${y1}Q${2 * mx - (x1 + x2) / 2} ${2 * my - (y1 + y2) / 2} ${x2} ${y2}`;
        wire.setAttribute("d", d);
        pulse.setAttribute("d", d);
        // strands round the back fade so the sphere still reads as a volume
        g.style.opacity = String(0.18 + ((da + db) / 2) * 0.82);
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

      // with the idle spin off there is nothing to repaint once it settles
      if (still && !dragging && Math.abs(vx) < 0.00001 && Math.abs(vy) < 0.00001) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    let running = true;
    let raf = requestAnimationFrame(tick);
    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointerdown", wake);
    el.addEventListener("pointermove", wake);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", wake);
      el.removeEventListener("pointermove", wake);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [points, edges, mids, words]);

  return (
    <div className="sphere" ref={root}>
      {/* aria-hidden: the skills are already listed as chips beside the sphere */}
      <svg className="web" aria-hidden="true">
        {edges.map(([a, b], i) => (
          <g className="strand" key={`${a}:${b}`}>
            <path className="wire" />
            {/* pathLength normalises the dash units, so one pulse is the same
                fraction of every strand however long it looks on screen. The
                phase spreads the strands out over the cycle, so only a handful
                are lit at once instead of all of them firing together. */}
            <path
              className="pulse"
              pathLength={1}
              style={{ ["--phase" as string]: i / edges.length }}
            />
          </g>
        ))}
      </svg>

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
