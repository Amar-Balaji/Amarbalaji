"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const COLS = 5;
const DURATION = 700; // keep in sync with .block transition-duration
const STAGGER = 90; // keep in sync with the --i delay in globals.css
const TOTAL = DURATION + STAGGER * (COLS - 1);

export default function Transition() {
  const [state, setState] = useState<"cover" | "reveal" | "idle">("cover");
  const pathname = usePathname();
  const router = useRouter();

  // uncover on load, and again after every navigation lands
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("idle");
      return;
    }
    const raf = requestAnimationFrame(() => setState("reveal"));
    const done = setTimeout(() => setState("idle"), TOTAL);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [pathname]);

  // cover the screen before letting the router move
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest("a");
      const href = link?.getAttribute("href");
      if (!href || link!.target === "_blank") return;
      if (!href.startsWith("/") || href === pathname) return;

      e.preventDefault();
      e.stopPropagation();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      setState("cover");
      setTimeout(() => router.push(href), TOTAL);
    };

    // capture phase: next/link handles clicks on bubble, this has to run first
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  return (
    <div className="transition" data-state={state} aria-hidden>
      {[0, 1].map((row) => (
        <div className={`transition-row row-${row + 1}`} key={row}>
          {Array.from({ length: COLS }, (_, i) => (
            <div className="block" key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>
      ))}
    </div>
  );
}
