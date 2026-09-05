"use client";

import { useState } from "react";
import Tunnel from "./Tunnel";
import PillNav from "./PillNav";

export default function Hero({
  images,
  name,
  roles,
}: {
  images: string[];
  name: string;
  roles: string[];
}) {
  const [explored, setExplored] = useState(false);

  return (
    <main>
      {/* the only text on the page - kept off screen, not out of the DOM */}
      <h1 className="sr-only">
        {roles.length ? `${name} — ${roles.join(", ")}` : name}
      </h1>
      <Tunnel images={images} onInteract={() => setExplored(true)} />

      <div className="drag-hint" data-hidden={explored}>
        <span>Drag to explore</span>
        <span className="drag-hint-line" />
      </div>

      <PillNav />
    </main>
  );
}
