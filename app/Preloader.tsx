"use client";

import { useEffect, useState } from "react";
import { PRELOAD_MS } from "./preload";

const TENS = [0, 2, 4, 6, 8, 9];
const ONES = [0, 5, 0, 5, 0, 9];

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setDone(true), PRELOAD_MS);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <div className="loader" aria-hidden>
      <div className="counter">
        {[TENS, ONES].map((strip, s) => (
          <div className="count-wrapper" key={s}>
            <div className="count">
              {strip.map((d, i) => (
                <div className="digit" key={i}>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {[1, 2, 3].map((i) => (
        <div className={`revealer revealer-${i}`} key={i} />
      ))}
    </div>
  );
}
