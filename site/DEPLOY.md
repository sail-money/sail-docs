# Deploying the Sail docs to Azure Static Web Apps

Handoff guide for hosting `docs.sail.money`. The docs are a self-hosted **Astro Starlight**
site in this repo (`sail-money/sail-docs`, branch `main`), in the `site/` folder. It builds to
static files for **Azure Static Web Apps (SWA)** — the same platform `sail.money` already runs on.

GitBook currently serves `docs.sail.money` and **stays live until the DNS cutover**, so this is
zero-downtime.

## Build facts (already configured, do not change)

| | |
|---|---|
| App source | `site/` |
| Build command | `npm run build` |
| Output folder | `dist` |
| Node | ≥ 20.3 (pinned via `site/.nvmrc` + `engines`) |
| Host config | `site/public/staticwebapp.config.json` (ships into `dist/` automatically) |
| Search / llms.txt | built automatically (Pagefind + `/llms.txt`, `/llms-full.txt`) |

The build reads the repo's root markdown as its source, so the whole repo must be checked out
(the default in the SWA GitHub Action). The site is fully static — no API, no server.

## Prerequisites

- **Contributor** access to the Azure subscription where `sail.money` is hosted (reuse the same one).
- **Admin** on the `sail-money/sail-docs` GitHub repo (so the SWA wizard can add its deploy workflow + secret).
- Access to the **DNS zone for `sail.money`** (to repoint the `docs` record at cutover).

## Step 1 — Create the Static Web App (CI/CD from `main`)

1. Azure Portal → **Create a resource → Static Web App**.
2. Basics:
   - Plan: **Standard** (recommended; Free also supports custom domains).
   - Source: **GitHub** → authorize → Org `sail-money`, Repo `sail-docs`, Branch `main`.
3. Build details:
   - Build Presets: **Custom** (or "Astro" if offered).
   - **App location:** `site`
   - **Api location:** *(leave blank)*
   - **Output location:** `dist`
4. Create. Azure commits a workflow at `.github/workflows/azure-static-web-apps-*.yml` and adds a
   deployment-token secret. The first build runs automatically.

If the auto-generated workflow does not run the full build, confirm the deploy step has:

```yaml
app_location: "site"
output_location: "dist"
```

No `api_location`. Oryx runs `npm install` then `npm run build` in `site/` (which runs the
sync → astro build → clean-urls → llms pipeline).

## Step 2 — Verify on the temporary Azure URL (before touching DNS)

Azure gives you a `https://<name>.azurestaticapps.net` URL. Confirm all of this there **first**:

- Home loads; **dark theme**, the **SAIL** wordmark, and the section banners render.
- These five **load-bearing** paths return 200 (the marketing site deep-links them):
  `/legal/privacy-policy` · `/legal/terms-of-use` · `/legal/disclaimer` ·
  `/legal/open-source-licenses` · `/protocol/security`
- Group-node redirects work: `/sailor` → `/sailor/sailor`, `/protocol` → `/protocol/protocol`,
  `/legal` → `/legal/legal`.
- `/llms.txt` and `/llms-full.txt` load as plain text.
- **Search** (Cmd/Ctrl + K) opens and returns results.
- Spot-check deep pages: `/sailor/shipyard`, `/protocol/reference/addresses`, `/for-ai-agents`.

If a page 404s, it is almost always the App/Output location — re-check `site` / `dist`.

## Step 3 — Cut over `docs.sail.money` (DNS)

Do this only after Step 2 passes. GitBook keeps serving until DNS propagates, so it is safe.

1. Static Web App → **Custom domains → Add** → `docs.sail.money`. Azure gives you a validation
   target (a `CNAME` to your `*.azurestaticapps.net`, or a `TXT` for validation).
2. In the `sail.money` DNS zone, **repoint the `docs` record** from GitBook's target to the Azure
   target Azure shows you. (You are replacing the record GitBook currently uses.)
3. Wait for validation to go green in Azure (minutes to a couple of hours). Azure auto-provisions
   the TLS certificate.
4. Once `https://docs.sail.money` serves the new site, **re-run the Step 2 checklist against
   `docs.sail.money`** (especially the five load-bearing slugs and search).

## Step 4 — After cutover

- **Leave GitBook alone until `docs.sail.money` is confirmed fully live on Azure.** Then, optionally,
  disconnect GitBook's Git Sync so it stops ingesting (Space → Settings → Git Sync → disconnect).
  Do not delete the GitBook space yet — keep it as a rollback for a week or two.
- From here, **any merge to `main` auto-deploys** via the SWA GitHub Action. Content is edited as
  markdown in the repo root exactly as before.

## Rollback

If anything looks wrong after cutover: **point the `docs` DNS record back to GitBook's target.**
GitBook is still connected and will serve immediately once DNS reverts. No data is lost.

## Notes / gotchas

- **Do not** add a trailing-slash or clean-URL rule in the workflow. The site already emits
  extensionless URLs, and `staticwebapp.config.json` (in the build output) handles trailing-slash,
  the group-node redirects, and the 404 fallback. SWA serves `/foo` from `foo.html` automatically.
- Fonts, the search index, and the llms files are all generated at build time and served from the
  same origin (no external CDNs).

## Local preview (optional, to compare before/after)

```bash
cd site
npm install
npm run build
npx serve dist -l 4321   # then open http://localhost:4321
```
