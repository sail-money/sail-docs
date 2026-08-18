# Sail docs site (Astro Starlight)

Self-hosted build of the Sail documentation. The repo's GitBook markdown at the
repo root stays the single source of truth (GitBook keeps rendering it); this app
generates a static Starlight site from that same content.

## How it works

- `scripts/sync-content.mjs` copies the root markdown into `src/content/docs/`,
  converting GitBook constructs to Starlight (hints to asides, tabs to `<Tabs>`,
  the landing card table to clickable cards, `.gitbook/assets` images to
  `/assets/`), and preserving every live slug exactly (including the group-node
  doubling: `sailor/README.md` -> `/sailor/sailor`).
- `scripts/clean-urls.mjs` rewrites internal links to be extensionless and
  trailing-slash-free, matching the current GitBook URLs. Azure Static Web Apps
  serves `foo.html` at `/foo`.
- `scripts/llms-index.mjs` writes `dist/llms.txt` as a full page index; the
  `starlight-llms-txt` plugin generates `dist/llms-full.txt`.
- Host-level redirects and 404 handling live in `../staticwebapp.config.json`.

## Commands

```bash
npm install
npm run build      # sync + astro build + clean-urls + llms index -> dist/
npm run dev        # local dev server
npx serve dist     # preview the static build with clean URLs
```

Generated directories (`src/content/docs/`, `public/assets/`, `dist/`) are
git-ignored; they are rebuilt from the root content by `npm run build`.

## Page covers

Two overview pages carried covers in GitBook (`sailor/README.md`,
`protocol/README.md`). Drop the banner images into `src/assets/` and add a
`hero`/cover reference to wire them in.
