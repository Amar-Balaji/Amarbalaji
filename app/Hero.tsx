"use client";

import { useState } from "react";
import Tunnel from "./Tunnel";
import PillNav from "./PillNav";

export default function Hero({ images }: { images: string[] }) {
  const [explored, setExplored] = useState(false);

  return (
    <main>
      <Tunnel images={images} onInteract={() => setExplored(true)} />

      <div className="drag-hint" data-hidden={explored}>
        <span>Drag to explore</span>
        <span className="drag-hint-line" />
      </div>

      <PillNav />
    </main>
  );
}
