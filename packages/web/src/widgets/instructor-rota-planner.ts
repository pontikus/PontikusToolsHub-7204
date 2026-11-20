import { instructorRota, weekDays } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, starterShell } from "./kit";

const PEOPLE = 5;

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const examples = [
    { name: "Alex", maxDays: 5, days: ["Mon", "Tue", "Wed", "Sat", "Sun"] },
    { name: "Priya", maxDays: 4, days: ["Thu", "Fri", "Sat", "Sun"] },
    { name: "Tom", maxDays: 2, days: ["Sat", "Sun"] },
  ];
  const state: Record<string, unknown> & { rows: { name: string; maxDays: number }[]; need: { n: number }[] } = {
    rows: Array.from({ length: PEOPLE }, (_, i) => ({ name: examples[i]?.name ?? "", maxDays: examples[i]?.maxDays ?? 5 })),
    need: [1, 1, 1, 1, 2, 3, 3].map((n) => ({ n })),
  };
  for (let i = 0; i < PEOPLE; i++) state[`d${i}`] = examples[i]?.days ?? [];
  const dayBoxes = (i: number) =>
    `<div class="pkst-days" role="group" aria-label="Days available">${weekDays
      .map((d) => `<label><input type="checkbox" data-list="d${i}" value="${d}"${(state[`d${i}`] as string[]).includes(d) ? " checked" : ""}><span>${d}</span></label>`)
      .join("")}</div>`;
  const form =
    `<fieldset class="pkst-field"><legend class="pkst-label">Instructors needed each day</legend>
      <div class="pkst-week">${weekDays
        .map((d, i) => `<label>${d}<input type="number" inputmode="decimal" min="0" max="20" step="1" data-row="${i}" data-f="n" data-set="need" value="${state.need[i].n}" aria-label="Instructors needed on ${d}"></label>`)
        .join("")}</div></fieldset>` +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Instructor ${i + 1}</legend>
        <div class="pkst-row2">${field("text", "name", "Name", r.name, { row: i, attrs: { maxlength: 30 } })}${field("number", "maxDays", "Most days a week", r.maxDays, { row: i, attrs: { min: 0, max: 7, step: 1 } })}</div>
        <span class="pkst-hint">Days they can work</span>${dayBoxes(i)}</fieldset>`,
      )
      .join("");
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Planner",
    intro: "Cover busy sessions without overstaffing quiet ones. Set how many instructors you need each day and when each person can work, and get a weekly rota with the gaps shown. An example team is filled in.",
    form,
  });
  const render = () => {
    const r = instructorRota(
      state.rows.map((p, i) => ({ ...p, days: state[`d${i}`] as string[] })),
      state.need.map((x) => x.n),
    );
    result.innerHTML = `<p class="pkst-eyebrow">${r.gaps.length ? "GAPS TO FILL" : "ROTA"}</p>
      <div class="pkst-score"><strong>${r.gaps.reduce((s, g) => s + g.short, 0)}</strong><span>${r.gaps.length ? "shifts with nobody to cover them" : "gaps · every day is covered"}</span></div>
      <ol class="pkst-tips">${r.days
        .map(
          (d) => `<li class="${d.short > 0 ? "is-weak" : ""}"><span>${d.day}</span><b>${d.need ? (d.on.length ? esc(d.on.join(", ")) : "Nobody") : "Closed or no sessions"}</b><div>${
            d.short > 0 ? `Need ${d.short} more.` : d.need ? `Covered${d.spare.length ? `. On call: ${esc(d.spare.join(", "))}` : ""}.` : ""
          }</div></li>`,
        )
        .join("")}</ol>
      <p style="margin-top:12px">${r.shifts.map((p) => `${esc(p.name)}: ${p.shifts} day${p.shifts === 1 ? "" : "s"}`).join(" · ")}</p>
      ${r.gaps.length ? `<div class="pkst-fix"><p class="pkst-eyebrow">TO COVER THE GAPS</p><p>Ask who can add a day on ${esc(r.gaps.map((g) => g.day).join(", "))}, bring in a freelance instructor, or merge small sessions on those days.</p></div>` : ""}`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
