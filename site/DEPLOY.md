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
- **Admin** on the `sail-money/sail-docs` GitHub repo (to add the `AZURE_STATIC_WEB_APPS_API_TOKEN_DOCS` secret).
- Access to the **DNS zone for `sail.money`** (to repoint the `docs` record at cutover).

## Create the Static Web App and wire the deploy token

This repo already ships its own workflow at
[`.github/workflows/azure-static-web-app.yml`](../.github/workflows/azure-static-web-app.yml)
(same multi-environment pattern as `sail-money-landing-page`: tags -> production, `main` -> dev,
manual dispatch -> test, PRs -> per-PR preview + teardown on close). You do not need the Portal
wizard to generate a workflow — just create the SWA resource and give the existing workflow its
deployment token.

**Azure SWA resource requirements:**

| Setting | Value |
|---|---|
| Resource type | Static Web App |
| Plan | **Standard** (required for multiple named environments/staging slots beyond PR previews; Free also supports custom domains but caps staging environments) |
| Deployment source | Choose **"Other"** (not GitHub-managed CI/CD) so Azure does not overwrite this repo's workflow with its own |
| App location | `site` |
| Api location | *(blank — no API/functions)* |
| Output location | `dist` (resolves to `site/dist`, since App location is `site`) |
| Node version | ≥ 20.3 (matches `site/.nvmrc` + `engines`) |

1. Azure Portal → **Create a resource → Static Web App**.
2. Basics: Plan **Standard**; Deployment source **Other** (skip the GitHub connection step —
   this avoids Azure auto-committing a second, conflicting workflow file).
3. Create the resource. Once provisioned, go to **Overview → Manage deployment token** and copy it.
4. In the GitHub repo (`sail-money/sail-docs`) → **Settings → Secrets and variables → Actions**,
   add a repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN_DOCS` with that token value.
   (The workflow file references this exact secret name — rename both together if you change it.)
5. Push to `main` (or re-run the workflow manually via `workflow_dispatch`) to trigger the first
   deploy to the `dev` environment.

Oryx runs `npm install` then `npm run build` in `site/` (which runs the
sync → astro build → clean-urls → llms pipeline). The whole repo is checked out (default
`actions/checkout` behavior), which the build needs since it reads the root markdown as content.

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
