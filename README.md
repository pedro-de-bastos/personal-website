# Pedro Martins de Bastos

A static academic website about human–AI teams, built with Astro and native HTML, CSS, TypeScript, and canvas. No runtime APIs, external fonts, analytics, cookies, or framework hydration. The installed dependencies and lockfile are unchanged.

Use Node matching `package.json` (`>=22.23.4`); CI uses Node 24.22.1. On a fresh checkout, install with `npm ci`. Set `ASTRO_TELEMETRY_DISABLED=1` for every Astro command.

```sh
ASTRO_TELEMETRY_DISABLED=1 npx astro dev --background
ASTRO_TELEMETRY_DISABLED=1 npx astro dev status
ASTRO_TELEMETRY_DISABLED=1 npx astro dev logs
ASTRO_TELEMETRY_DISABLED=1 npx astro dev stop

ASTRO_TELEMETRY_DISABLED=1 npx astro check
ASTRO_TELEMETRY_DISABLED=1 npm run build
node scripts/verify-site.mjs --base /
ASTRO_TELEMETRY_DISABLED=1 npm run preview -- --host 127.0.0.1
```

The default build uses `/`. Validate the project-page deployment separately:

```sh
ASTRO_TELEMETRY_DISABLED=1 BASE_PATH=/personal-website npm run build
node scripts/verify-site.mjs --base /personal-website/
ASTRO_TELEMETRY_DISABLED=1 BASE_PATH=/personal-website npx astro dev --background
```

Open the local URL reported by Astro with the configured base appended. `SITE_URL` defaults to `https://pedro-de-bastos.github.io`; `BASE_PATH` is validated and defaults to `/`. Assets and the canonical URL account for the configured base.

Edit biography, publications, author orders, labels, findings, and source evidence in `src/data/content.ts`. Components render the narrative and complete accessible tables on the server; scripts read only the public rendered labels. Do not serialize provenance to the browser or put raw research inputs in `public/`. There is no public CV PDF or portrait.

The three visuals describe reported directions. The illustrative team uses arbitrary presentation sizes, labeled accordingly. Its halos indicate the direction of reported belonging, with no measured relationship edges. TRAIL compares observed personas without significance tests; its flow describes platform components, with dual memory integrated in the message pipeline. Out of sync shows only the first and last analyzed sessions, with no fitted trajectory. All updates use 500ms transitions except under reduced motion. Complete tables remain visible without JavaScript and can be expanded with it.

The hero network caps rendering at 30fps, uses at most 12/20/30 nodes, bounds node degree and edge counts, and pauses when off screen or hidden. Small connected clusters drift together, with occasional approaches, connections, merges, and splits. Reduced motion produces a static clustered frame. Orange sparks and a rare orange ring are decorative, not research encodings.

The verifier checks generated content, approved authors and links, forbidden metadata, base-aware asset existence, configured contrast, figure alternatives, client bundles, and the manual workflow. Browser review should also cover keyboard use, screen-reader announcements, 360–1440px layouts, zoom, forced colors, JavaScript disabled, motion preferences, and animation lifecycle. Automated checks do not replace an assistive-technology review.

Deployment is manual only. The Pages workflow is stored at `deploy/github-pages-workflow.yml` (the box's GitHub token lacks the `workflow` scope, so it could not be pushed under `.github/`). To enable it, move it to `.github/workflows/deploy.yml` (e.g., via the GitHub web UI or a token with `workflow` scope). After reviewing the implementation, set repository **Settings → Pages → Source → GitHub Actions**, then run **Deploy personal website** against the reviewed revision. The workflow builds for `/personal-website` and deploys via the Pages artifact actions. There are no push, pull-request, or scheduled triggers. This implementation does not publish the site. Confirm the repository target before dispatch and verify `https://pedro-de-bastos.github.io/personal-website/` afterward. A future domain requires separately updating `SITE_URL`, setting `BASE_PATH=/`, and configuring Pages/DNS.

The About and values copy are drafts for Pedro’s voice. The LinkedIn URL follows the explicit brief and still merits Pedro’s confirmation.

## Publishing without Actions (current method)

The site is served by GitHub Pages from the `gh-pages` branch, which `scripts/publish-gh-pages.sh` builds and pushes:

- `scripts/publish-gh-pages.sh project` publishes the preview at https://pedro-de-bastos.github.io/personal-website/ (base `/personal-website/`, no CNAME).
- `scripts/publish-gh-pages.sh domain` rebuilds for the root path, writes `CNAME` from `deploy/CNAME` (currently `pedromdb.me`), and sets the Pages custom domain. Point DNS at GitHub Pages first.

`deploy/CNAME` is intentionally not in `public/`, so the preview build does not redirect to an unconfigured domain.
