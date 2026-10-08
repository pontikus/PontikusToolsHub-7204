# Pontikus Boatyard — admin guide

## What is ready
The hub lists all 14 tools as live; counts come from the catalogue. Tools 1–8:
- `/tools/postcard`: front/back A6 postcard, four styles and an editable sign-off (default “With love,”).
- `/tools/passport`: up to 12 stamp-style places with date and note, on one A4 page.
- `/tools/journal`: up to seven days, guided prompts and three photographs per day; one A4 page per day.
- `/tools/photo-frame`: caption, location and photographer credit; square or vertical formats.
- `tools/media-kit`: six services, three credentials, region, bio and optional photo on one A4 page.
- `tools/rate-card`: twelve service rows, GBP/EUR/USD, terms, validity and contact; automatic second A4 page when rows overflow.
- `tools/credential-card`: five credentials with issuer/year, optional photo; front/back 86 × 54 mm personal summary. Always labelled “Pontikus verification: not yet verified”.
- `tools/availability`: six locations with date ranges and notes, season and booking contact; A4 or 1080 × 1350 social output.
Tools 9–14 are the Shoreline Businesses set, documented below. New samples use bracketed placeholders, not invented qualifications or testimonials.

## The files to edit
- `packages/web/src/web/lib/catalogue.ts`: tool names, promises, statuses, audiences, 18 region names and destination URLs.
- Replace `[VERIFY URL]` and `[SUGGESTION FORM URL]` in that file with your real links. Until then, buttons explain that their destination has not been connected.
- `packages/web/src/web/styles.css`: colours, fonts, spacing and responsive rules. Brand colours are at the top.
- `packages/web/public/images/pontikus-logo.png`: your supplied, unchanged logo.
- `packages/web/src/web/components/tool-shell.tsx`: shared four-step layout and frame control.
- `packages/web/src/web/pages/postcard.tsx`: postcard inputs and downloads.
- `packages/web/src/web/lib/postcard-canvas.ts`: the four postcard designs. Both preview and download use this same renderer.
- New makers have their own matching page and canvas files (`passport`, `journal`, `photo-frame`).
- `components/canvas-maker.tsx`: reusable style controls, photo upload, preview and downloads for the new tools.
- `components/expert-fields.tsx`: repeatable entries, 18-region dropdown, optional photo control and per-tool memory-only drafts.
- `lib/expert-canvas.ts`: four isolated render functions for the Coastal Experts tools. A measured fit-to-box helper keeps long text within its allocated panel; repeated whitespace is normalised in exports.
- `lib/canvas-utils.ts`: explicit loading of all three fonts, effective frame setting, canvas text wrapping, photo handling and PNG/PDF export.
- `packages/web/index.html`: British-English metadata and absolute Open Graph image URL. The image is a public copy of the supplied logo; replace its absolute URL if you host another social-sharing image.

## Frame removal
The lock icon and verified-profile wording are shown. For this review the toggle works without verification. The public setting is `settings.gateFrameRemoval`; set it to `true` to enable gating. The private initial backing value in `catalogue.ts` is currently false. A future profile integration can set `settings.gateFrameRemoval = true` at runtime: the setting notifies already-open tools, restores their frame and disables/unchecks the toggle. Every renderer computes `removeFrame && !settings.gateFrameRemoval`; previously saved in-memory choices cannot bypass a locked frame. A real verified-profile entitlement is not connected.

## Downloads and privacy
- PNG download creates a ZIP with separate front and back PNGs, 1748 × 1240 px.
- PDF download creates two A6 landscape pages (148 × 105 mm). Print at actual size; these are not a duplex-imposition or bleed service.
- Passport: 1748 × 2480 PNG, or one A4 PDF page. It is a personal keepsake, not an official travel document.
- Journal: one 1748 × 2480 PNG per day (ZIP for multiple days), or a multi-page A4 PDF.
- Photo Frame: 1080 × 1080 or 1080 × 1920 PNG; PDF paper is 180 × 180 mm or 180 × 320 mm to preserve the ratio. Choose each format and download it separately.
- Media kit: one 1748 × 2480 PNG or A4 PDF.
- Rate card: one or two 1748 × 2480 pages; multi-page PNGs in ZIP, or A4 PDF. Row heights are measured; terms and contact repeat on every page.
- Credential card: two 1016 × 638 PNGs in ZIP, or two 86 × 54 mm PDF pages. Front identifies the owner and unverified status; back lists self-reported credentials. This is not an official certificate.
- Availability: choose A4 (1748 × 2480 PNG / A4 PDF) or social (1080 × 1350 PNG / 216 × 270 mm PDF). Download each format separately.
- New field limits: media bio 500, services 90 each, credentials 140 each; rate service 100, unit 30, price 12, terms 300; card credential 65, issuer 45, year 6; availability location 60 and note 90. Name, role and contact fields are also bounded. Long text is fitted, not allowed to overlap neighbouring fields.
- New tools offer Classic, Midnight and Studio styles. Every PNG/PDF uses the same rendered page canvases as its live preview. All three export fonts are explicitly loaded before drawing; failures are reported rather than silently exporting fallback fonts.
- JPG, PNG and WebP photos up to 20 MB are read locally. Sample photo can be replaced by the user.
- Maker details live in module memory, persist across internal navigation, and clear on refresh. No localStorage, cookies, maker API or database is used by the tools.
- Google Fonts and the sample/static images are fetched for display. The managed platform includes its required analytics infrastructure; the privacy claim refers to maker details and uploaded photos, not to absence of all network activity.

## Hosting
Keep these rules for every future change:
- Static image URLs use `asset()` from `lib/asset.ts`, never root `/images/...` URLs.
- Preserve `<Router base={routerBase}>` and Vite `base: process.env.VITE_BASE || "/"`.
- Do not change `.github/workflows/pages.yml`. Keep exact `slug: "..."` formatting in the catalogue because the workflow greps it.
- Do not edit files listed in `.runable/protected-files.json`.
- Run typecheck, tests and `VITE_BASE=/test/ bun run build`; inspect generated assets for root paths.

This is the managed Bun/Vite/React project, with the existing GitHub Pages support retained. `.github/workflows/pages.yml`, the Vite `base` configuration and `lib/asset.ts` were not changed. The Router retains its `routerBase`. Internal links use `asset()` plus Wouter’s `~` prefix to avoid adding the sub-folder twice; image URLs also use `asset()`. Slugs retain the workflow-readable `slug: "..."` format. The workflow copies a real index page for every catalogue tool. Build and local navigation were tested under `/PontikusTools-7229/`; a new public deployment has not been performed in this build task.

Known pre-existing template limitation: the required Runable analytics plugin injects a root `/runable.js` URL, which returns 404 in the local sub-folder test. Tool images, routes and downloads are unaffected. The template-managed analytics plugin was left intact; its sub-folder support needs a platform-level fix.

## Embed in Pontikus / WordPress
Add `?embed=1` to any live tool URL. It hides the site header, footer and “All tools” link while retaining the maker and privacy note. For a WordPress Custom HTML block, replace `[PUBLISHED BOATYARD URL]` below with the complete published site base, including its repository sub-folder (no trailing slash):

```html
<iframe
  src="[PUBLISHED BOATYARD URL]/tools/postcard?embed=1"
  title="Pontikus Postcard Maker"
  width="100%"
  height="1800"
  style="border:0; display:block;"
  loading="lazy"
  allow="downloads"
></iframe>
```

Swap `postcard` for any live tool slug and update the title. The iframe has a fixed initial height; long forms can scroll inside it. Avoid a sandbox attribute unless you configure it to permit scripts, same-origin access and downloads.

**Published framing permission: not confirmed.** No published Boatyard URL was available to check. Local embed mode was tested, but that does not establish whether the published site permits embedding on `https://pontikus.com`. The published response must have no blocking `X-Frame-Options` policy, and its CSP `frame-ancestors` must permit `https://pontikus.com` (and `https://www.pontikus.com` if used). Hosting/proxy policy cannot be overridden from React or an HTML meta tag. Check the actual published response headers and test inside Pontikus before launch.

## Stage-two verification
Historical stage-two check: build and lint passed. Tools 1–4 tested at 390px without horizontal overflow. Embed navigation hiding, runtime gate restoration and PNG/PDF downloads tested. Passport tested at 12 entries; Journal tested at seven days and three photographs, with seven-page A4 PDF and seven PNGs.

## Stage-three verification
Historical stage-three check: tools 5–8 tested at 390px with every repeatable entry added and fields filled to maximum length. Classic/Midnight/Studio, local photos, page titles, audience, embed mode, runtime frame locking, PNG/PDF downloads and sub-folder navigation passed. Rate overflow produces two A4 pages; credential PDF has two wallet-size pages; social availability PNG is exactly 1080 × 1350.

## Shoreline Businesses — tools 9–14
All six use `pages/business-maker.tsx`, independent in-memory drafts keyed by slug, and renderers in `lib/business-canvas.ts`. Validation and pagination helpers live in `lib/business-layout.ts`. Classic, Midnight and Studio, the optional frame and Get verified placeholder are present on each page.

| Tool / route | Fields and limits | Outputs |
|---|---|---|
| 9 Review Poster / `review-poster` | Business 60, headline 60, short line 120, required HTTPS review URL 2048, optional logo | A4 1748 × 2480; A6 portrait 1240 × 1748 / 105 × 148 mm |
| 10 Event Flyer / `event-flyer` | Title 70, date, start/end times, venue 80, description 240, price/entry 40, contact 100, optional image | A4 or 1080 × 1350 / 216 × 270 mm |
| 11 Offer Board / `offer-board` | Section heading 60, up to 10 names 50 / notes 70 / prices 12, GBP/EUR/USD, optional valid-until date | Measured rows, one or two A4 pages, ZIP when multi-page |
| 12 Job Post / `job-post` | Business 60, role 70, location 60, job type, start date, description 360, up to five requirements 90, how to apply 120, optional closing date | A4 or 1080 × 1350 / 216 × 270 mm |
| 13 Harbour Notice / `notice` | Business 60, type, headline 70, message 400, effective from/until, contact 100 | A4 or 1080 × 1350 / 216 × 270 mm |
| 14 Social Post Kit / `social-kit` | Business 60, headline 60, supporting line 120, CTA 50, optional image | Three PNGs: 1080 × 1080 / 1350 / 1920; ZIP plus each individually; three-page mixed-ratio PDF 216 × 216 / 270 / 384 mm |

Review QR generation uses the browser-local `qrcode` package. Empty, malformed, non-HTTPS and credential-bearing URLs show warnings and block downloads. The exact trimmed URL is encoded and printed beneath the QR; scan to test the actual destination before printing. No platform logos, review quotes or ratings are generated.

Event time and notice date ranges warn when reversed; job closing dates after the start date also warn. Offer prices are user-supplied. Job posts show “Check your local employment and equality rules before posting.” Notices always print “Notice issued by [business name]. Not an official harbour authority or safety notice.” with the entered name substituted. The official-channel reminder stays visible in the tool. No official emblems or authority claims are used.

Social story text, including its optional Pontikus frame, stays inside the 250–1670px safe area. The frame is placed at the bottom of that safe area on stories rather than in the platform overlay exclusion zone. Every PDF uses the corresponding page ratio; the Social Kit PDF preserves all three ratios instead of stretching the canvases. Uploaded JPG/PNG/WebP images and logos remain local, at most 20 MB each.

## Stage-four verification
- `bun test`: six tests pass, covering HTTPS checks, exact QR text, reversed date/time ranges, offer pagination, story bounds and maximum-length text fitting (315 assertions).
- `python tests/business-browser.py`: all six at 390px, every text field at its maximum and every repeatable entry filled, all three styles, local images, warnings, PNG/PDF downloads, alternate sizes, individual social downloads, story exclusion pixels, embed mode and runtime gating pass. Existing tools 1–8 still render in a smoke check; their pages/renderers were not edited.
- Export inspection: two A4 offer pages, three correctly proportioned social PDF pages, A4/A6 and social alternates have the expected sizes.
- Typecheck, lint and `VITE_BASE=/test/ bun run build` pass. Build reports a non-blocking large-chunk warning. All protected hashes and the workflow/Vite/asset helper hashes remain unchanged.
- All six `/test/` routes and their back links work. Root-path asset check cannot fully pass: the required protected analytics injection still requests `/runable.js` and returns 404 under the sub-path. Tool images and bundled assets use `/test/` correctly. This needs a platform-level fix, not a protected-file edit.
- No GitHub push or public deployment was performed. Publish-button state and published embedding permissions remain unverified.