"use client";

import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function PillNav() {
  const pathname = usePathname();
  return (
    <nav className="pill-nav">
      {LINKS.map((l) => (
        <a key={l.href} href={l.href} data-active={pathname === l.href}>
          {l.label}
        </a>
      ))}
    </nav>
  );
}
