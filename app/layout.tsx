import type { Metadata } from "next";
import { sanityFetch } from "../lib/sanity";
import "./globals.css";
import Transition from "./Transition";
import Cursor from "./Cursor";
import Preloader from "./Preloader";
import { Analytics } from "@vercel/analytics/next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await sanityFetch<{ seoTitle?: string; seoDescription?: string }>(
    `*[_type=="siteSettings"][0]{seoTitle, seoDescription}`
  );
  const title = s?.seoTitle ?? "Amar Balaji";
  return {
    // pages set their own short title; this frames it
    title: {default: title, template: "%s — Amar Balaji"},
    description: s?.seoDescription ?? "",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Preloader />
        <Transition />
        <Cursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
