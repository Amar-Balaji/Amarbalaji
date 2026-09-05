import type { Metadata } from "next";
import { sanityFetch, imageUrl } from "../lib/sanity";
import { siteUrl } from "../lib/site";
import "./globals.css";
import Transition from "./Transition";
import Cursor from "./Cursor";
import Preloader from "./Preloader";
import { Analytics } from "@vercel/analytics/next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await sanityFetch<{
    seoTitle?: string;
    seoDescription?: string;
    ogRef?: string;
  }>(
    `*[_type=="siteSettings"][0]{seoTitle, seoDescription,
      // no share image uploaded yet: the portrait is the next best face
      "ogRef": coalesce(ogImage.asset._ref, *[_type=="hero"][0].portrait.asset._ref)}`
  );
  const title = s?.seoTitle ?? "Amar Balaji";
  const description = s?.seoDescription ?? "";
  const images = s?.ogRef ? [imageUrl(s.ogRef, 1200)] : [];
  return {
    // absolute urls for the crawler; falls back to the Vercel domain
    metadataBase: new URL(await siteUrl()),
    // pages set their own short title; this frames it
    title: {default: title, template: "%s — Amar Balaji"},
    description,
    openGraph: {title, description, images, type: "website"},
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
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
