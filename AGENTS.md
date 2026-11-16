# Repository notes

Use the existing dependencies; no new packages. Never touch `.env`, secrets, or `.git`, and do not commit or deploy unless explicitly requested.

## Development

Set `ASTRO_TELEMETRY_DISABLED=1` for all Astro commands. Start the server with `astro dev --background`; manage it with `astro dev stop`, `astro dev status`, and `astro dev logs` (use the installed CLI through `npx`).

Keep visible copy and research mappings in `src/data/content.ts`. Keep provenance build-time only. Scripts must read only public rendered labels and categories. Preserve accessible findings tables when JavaScript is unavailable. Animate interactions over 400–600ms and snap under reduced motion. Background motion must pause off screen and when hidden, and honor reduced motion. There is no user pause control.

## Content rules

Only the three approved papers and AIED workshop service belong in featured work. Preserve author orders in the content file, with **Martins de Bastos, P.** (lowercase de) emphasized. HICSS is “HICSS-60 · Accepted · 2027”; TRAIL and Out of sync are only “Preprint (arXiv)”. No TRAIL repository link.

Exclude all other publications, submissions, review/process metadata, journal venues for preprints, CHI reviewer work, phone/address, employer financial figures or percentages, unverified awards/affiliations, and raw CV/paper assets. The About portrait is the approved photograph in `public/images`; do not add a placeholder or a CV download. Describe any Vienna work only as research collaborators at the University of Vienna.

No numerical research encoding without source evidence. HICSS GCA describes whole-team conversations; do not invent human-to-human edge strengths. Uncertain estimates remain uncertain. TRAIL comparisons are descriptive without significance tests; personality controls must not predict outcomes. Out of sync uses endpoint ordering only, with exploratory/configuration qualifications and no fabricated intermediate values.

## Verification

```sh
ASTRO_TELEMETRY_DISABLED=1 npx astro check
ASTRO_TELEMETRY_DISABLED=1 npm run build
node scripts/verify-site.mjs --base /
ASTRO_TELEMETRY_DISABLED=1 BASE_PATH=/personal-website npm run build
node scripts/verify-site.mjs --base /personal-website/
```

Manually review responsive layouts, keyboard/live regions, no-JavaScript tables, reduced motion, forced colors, print, and canvas lifecycle. Deployment stays `workflow_dispatch` only.

## Documentation

Consult the relevant Astro guides when network access is authorized. An explicit offline task takes precedence; use installed package references then.

- https://docs.astro.build/en/guides/routing/
- https://docs.astro.build/en/basics/astro-components/
- https://docs.astro.build/en/guides/framework-components/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/styling/
- https://docs.astro.build/en/guides/internationalization/
