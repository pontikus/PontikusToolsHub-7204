# Pontikus Boatyard — design direction
Stage four: six Shoreline Businesses makers preserve the existing shell and styles. Editorial flyers, plain review QR, measured offer rows, job information and clearly non-authority customer notices. Social kit provides square, portrait and story layouts with a 250px story text exclusion zone. Shared controls are extended only with optional props; tools 1–8 keep their existing defaults. New drawing logic lives in business-canvas.ts. No APIs or database changes.

Brand: deep navy #0B1F3B, gold #C6A04A, cream #F7F3EB, signal blue #0094ff, logo navy #074286.
Fraunces editorial headings, Archivo body, IBM Plex Mono numbered labels. Google Fonts.
Quiet coastal workshop, not nautical novelty. Cream paper, fine rules, squared cards, generous space, navy masthead and footer. A split editorial hero with layered postcard imagery. Gold accents and subtle contour-line decoration. Supplied PNG only for logo.
Mobile-first: 44px targets, clear focus states, responsive card grids and stacked maker. Text contrast AA; gold is decoration or paired with navy.
Hub: 14 catalogue cards grouped into three audiences, one live maker. Tool shell: four steps, form left, live canvas preview right, front/back selection and downloads.
Exports: A6 landscape, 1748×1240 pixels at approximately 300dpi. All data and photo processing stay in browser memory; no API calls, storage or authentication. Sample photo is clearly identified.
Locked frame-removal presentation with configurable gating, initially ungated. Placeholders for verification and suggestion URLs open a labelled information dialog rather than a broken external link.
Stage two: tools 1–4 share the four-step shell, configurable frame, explicit font-loading and session-only drafts. Passport is one A4 page with up to 12 stamp entries. Journal is up to seven A4 pages with three photos each. Photo frame uses square/vertical social canvases. Cream, midnight navy and minimal styles remain consistent with the original workshop.
Embed mode removes site navigation while keeping maker controls and privacy wording. Audience labels and live counts read the catalogue. Tools 5–14 remain planned.
Stage three: four Coastal Experts makers reuse the same shell, three styles and canvas pipeline. Media kit is a structured A4 profile with bounded service/credential panels. Rate card is a measured table with automatic second page. Credential summary is an 86×54 mm front/back card with explicit unverified wording. Availability uses the same content in A4 and 1080×1350 formats. Placeholder content only, no claims of credentials. Text boxes fit measured lines within reserved areas; all Pages configuration is retained.
# <App Name> — Design

> Starter design brief. Replace this content with the app you're building before writing any UI.
> Keep it short and concrete — it's the single source of truth for palette, typography, pages,
> screens, and flows across web, mobile, and desktop.

One-line description of the app, the platforms it ships on, the visual direction (style, feel), and the core job it does for the user.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css` (desktop loads the web UI).
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system light/dark setting.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| primary | #1F1F1F | #E5E5E5 | Buttons, active tab, accents |
| background | #FFFFFF | #0A0A0A | Page/screen background |
| card | #FFFFFF | #1A1A1A | Cards, surfaces |
| foreground | #171717 | #FAFAFA | Primary text |
| mutedForeground | #737373 | #A3A3A3 | Secondary text |
| border | #E5E5E5 | #262626 | Hairlines |
| destructive | #DC2626 | #EF4444 | Delete / errors |

## Typography

Name the display + body pairing here. Web: set font families in `styles.css` (self-hosted files go in `packages/web/public/fonts/`). Mobile: system font by default; load custom fonts with `useFonts` from `expo-font` and reference them via `Fonts` in `constants/theme.ts`.

## Pages & Screens

List each page/screen, its route file, and what it shows. Example:

- **Web — Home** (`packages/web/src/web/pages/index.tsx`) — what the user sees first.
- **Mobile — Home** (`packages/mobile/app/(tabs)/index.tsx`) — main tab.
- Add web pages under `src/web/pages/` (+ route in `app.tsx`); mobile tabs under `app/(tabs)/`, stack/modal screens under `app/`.

## Key User Flows

1. Describe the primary flow end to end (open → action → result).
2. ...

## Architecture

- **API**: typed oRPC client (`lib/api.ts` in each package) → the backend in `@template/web`. Query/mutation hooks live in `queries/` (one file per feature); pages/screens call them with `@tanstack/react-query`.
- **State/sync**: TanStack Query with optimistic updates for instant-feel interactions.
- **Auth / payments / uploads**: see `skills/app/references/` when those features are needed.
