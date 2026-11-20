# Starter tools for pontikus.com: paste-ready snippets

Each `.html` file here is one complete tool: a `<div>` plus one `<script>`. It carries its own styles (all scoped under `.pkst`), so it will not restyle the rest of the page, and it needs nothing else to run. Nothing a visitor types leaves their browser.

| File | Tool | Audience | Suggested page URL |
| --- | --- | --- | --- |
| `trip-readiness-wheel.html` | Trip Readiness Wheel | Sea Lovers | `/boatyard/trip-readiness-wheel` |
| `sea-swim-kit-checker.html` | Sea Swim Kit Checker | Sea Lovers | `/boatyard/sea-swim-kit-checker` |
| `profile-strength-checker.html` | Profile Strength Checker | Coastal Experts | `/boatyard/profile-strength-checker` |
| `occupancy-gap-finder.html` | Occupancy Gap Finder | Shoreline Businesses | `/boatyard/occupancy-gap-finder` |
| `season-readiness-wheel.html` | Season Readiness Wheel | Shoreline Businesses | `/boatyard/season-readiness-wheel` |

## Adding one tool to the live Boatyard (Brilliant Directories)

1. **Make a widget.** In the BD admin, open Toolbox → Widget Manager and create a new widget, for example `Pontikus Starter – Trip Readiness Wheel`. Paste the whole file into the widget's code and save. A widget is safer than the page editor, because the page editor can strip `<script>` tags.
2. **Make the page.** Create a new web page with the URL from the table, the same way the existing maker pages (such as `/boatyard/postcard-maker`) were set up, and place the widget on it (the widget shortcode, or however the other Boatyard pages include their Pontikus Compact widgets).
3. **Check it** while the page is still hidden or unpublished: move the sliders or tap the buttons and confirm the result changes, then check it on a phone.
4. **Link it.** Add a card for the tool to `/boatyard` (toolkit list) and to its audience page (`/boatyard/sea-lovers`, `/boatyard/coastal-experts` or `/boatyard/shoreline-businesses`).
5. Publish once it looks right.

## Links inside the tools

- "Get verified" and "Claim your profile" go to `/join-membership`.
- The Profile Strength Checker links to the live Rate Card Builder, Credential Card Maker, Availability Poster Maker and Media Kit Builder pages.
- The Trip Readiness Wheel links to the Boatcare Readiness Check and the Coastal Season Planner; the Season Readiness Wheel links to the Seaworthiness Ladder and the Off-Season Break-Even Calculator.

## Changing a tool

Edit the source in `packages/web/src/widgets/` (the wording and rules are in `packages/web/src/web/lib/starter-tools.ts`), then run `bun run widgets` in `packages/web` to regenerate these files. Do not edit the `.html` files by hand.

## Login check (Starter needs a pontikus.com account)

Each snippet now starts with a short PHP block. Brilliant Directories runs it on the server:

- Signed-in members get the tool. Their plan is passed in as `data-audience` and `data-level`
  (from the live subscription IDs in `src/widgets/bd-gate.ts`), ready for Levels 1-3.
- Everyone else sees a panel with the tool name, its promise, and Sign in (`/login`) and Register (`/join`) buttons.

Paste the whole file into the widget's content. The PHP only works inside a BD widget, not in a plain HTML block.
