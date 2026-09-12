# Sanity studio — schemas

The studio itself (project `iow9ex5z`, dataset `production`), living
alongside the site that reads it.

**This is the deployed studio.** The separate
`~/Downloads/studio-amarbalajiportfolio` copy the README used to point at is
gone; `sanity.cli.ts` here carries the `studioHost` and `appId`, so a schema
edit goes live from this folder:

    cd sanity
    npx sanity dev          # localhost:3333, to try a change first
    npx sanity deploy       # needs `npx sanity login` first

Until it is deployed, a new field exists only where the code runs - the
hosted studio at amarbalajiportfolio.sanity.studio keeps showing the old form
even though both read the same data.

## What the site reads

| Type | Fields used | Where |
|---|---|---|
| `hero` | name, roles, bio, portrait(+alt) | `/about` header |
| `skillGroup` | title, items, order | `/about` skill columns + tag sphere |
| `experienceEntry` | kind, title, subtitle, period, location, detail, order | `/about` experience & education |
| `contact` | email, phone, availability, socials | `/contact` |
| `siteSettings` | seoTitle, seoDescription, resume | page metadata + the Resume button |
| `project` | title, discipline, category, image(+alt), gallery, tools, liveUrl, behanceId, pdf, order | `/works` and the home tunnel |
| `renderFolder` | title, slug, order | the `/works` gallery sections |

Every field defined here is rendered somewhere. If a field stops being used,
delete it from both copies rather than leaving a dead input in the studio.

## Scripts

- `scripts/sync-content.mjs` — push the site's copy into Sanity (dry run by default)
- `scripts/prune-projects.mjs` — trim the project documents back to 35 images

Both need `SANITY_TOKEN` (Editor) and both print what they would do first.
