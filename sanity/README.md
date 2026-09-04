# Sanity studio — schemas

A copy of the live studio at `~/Downloads/studio-amarbalajiportfolio`
(project `iow9ex5z`, dataset `production`), kept here so the field
definitions live alongside the site that reads them.

**This copy is a reference, not the deployed studio.** Editing a schema here
changes nothing until the same edit is made in the studio folder and pushed:

    cd ~/Downloads/studio-amarbalajiportfolio
    npx sanity deploy       # needs `npx sanity login` first

## What the site reads

| Type | Fields used | Where |
|---|---|---|
| `hero` | name, roles, bio, portrait(+alt) | `/about` header |
| `skillGroup` | title, items, order | `/about` skill columns + tag sphere |
| `experienceEntry` | kind, title, subtitle, period, location, detail, order | `/about` experience & education |
| `contact` | email, phone, availability, socials | `/contact` |
| `siteSettings` | seoTitle, seoDescription, resume | page metadata + the Resume button |
| `project` | title, discipline, category, image(+alt), liveUrl, behanceId, order | `/works` and the home tunnel |

Every field defined here is rendered somewhere. If a field stops being used,
delete it from both copies rather than leaving a dead input in the studio.

## Scripts

- `scripts/sync-content.mjs` — push the site's copy into Sanity (dry run by default)
- `scripts/prune-projects.mjs` — trim the project documents back to 35 images

Both need `SANITY_TOKEN` (Editor) and both print what they would do first.
