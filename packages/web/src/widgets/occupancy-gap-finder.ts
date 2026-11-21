import { months, occupancyGaps } from "../web/lib/starter-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { atLeast, starterShell, syncMonths, toolLevel } from "./kit";

// Example figures only, so the result is not empty on first load. Labelled as such.
const example = [35, 40, 50, 60, 70, 85, 95, 95, 75, 55, 40, 45];

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  // Level 1: add what guests spend on top of the room, so the gap shows the full cost.
  const full = atLeast(toolLevel(root, "shoreline-businesses"), "level1");
  const state = { rooms: 8, rate: 120, target: 70, currency: "£", extra: 0, occupancy: [...example] };
  const num = (key: string, label: string, value: number, attrs: string) =>
    `<label class="pkst-field"><span class="pkst-label">${esc(label)}</span><input type="number" inputmode="decimal" data-k="${key}" value="${value}" ${attrs}></label>`;
  const form = `
    <div class="pkst-row2">
      ${num("rooms", "Rooms or units", state.rooms, 'min="1" max="10000" step="1"')}
      <label class="pkst-field"><span class="pkst-label">Currency</span>
        <select data-k="currency">${["£", "€", "$"].map((c) => `<option${c === state.currency ? " selected" : ""}>${c}</option>`).join("")}</select></label>
    </div>
    <div class="pkst-row2">
      ${num("rate", "Average nightly rate", state.rate, 'min="0" step="1"')}
      ${num("target", "Target occupancy (%)", state.target, 'min="0" max="100" step="1"')}
    </div>
    ${full ? num("extra", "Extra spend per occupied night (food, drinks, activities)", state.extra, 'min="0" step="1"') : ""}
    <fieldset class="pkst-field"><legend class="pkst-label">Occupancy by month (%)</legend>
      <span class="pkst-hint">Example figures are filled in. Replace them with your own.</span>
      <div class="pkst-months">${months
        .map((m, i) => `<label>${m}<input type="number" inputmode="decimal" min="0" max="100" step="1" data-m="${i}" value="${state.occupancy[i]}" aria-label="${m} occupancy percent"></label>`)
        .join("")}</div>
    </fieldset>`;
  const { result, levels } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Calculator",
    intro: "Find the months where empty rooms cost you most, and how many extra nights would close each gap.",
    form,
  });

  const money = (n: number) => state.currency + Math.round(n).toLocaleString("en-GB");
  const render = () => {
    const r = occupancyGaps({ ...state, rate: Number(state.rate) + (full ? Number(state.extra) || 0 : 0) });
    const bars = r.rows
      .map(
        (row) => `<li class="${r.worst && row.month === r.worst.month ? "is-worst" : ""}">
          <span>${row.month}</span>
          <span class="pkst-bar" aria-hidden="true"><i style="width:${row.occupancy}%"></i><b style="left:${Math.min(100, state.target)}%"></b></span>
          <span>${row.lostRevenue > 0 ? money(row.lostRevenue) : "on target"}</span>
        </li>`,
      )
      .join("");
    result.innerHTML = r.gapMonths === 0
      ? `<p class="pkst-eyebrow">YOUR GAPS</p><h3>Every month meets your ${esc(state.target)}% target.</h3>
         <ul class="pkst-bars" aria-label="Occupancy by month">${bars}</ul>`
      : `<p class="pkst-eyebrow">REVENUE BELOW TARGET, PER YEAR</p>
        <div class="pkst-score"><strong>${money(r.totalLostRevenue)}</strong></div>
        <p>${r.gapMonths} month${r.gapMonths === 1 ? "" : "s"} below your ${esc(state.target)}% target, ${r.totalLostNights.toLocaleString("en-GB")} room nights in all.</p>
        <div class="pkst-fix">
          <p class="pkst-eyebrow">BIGGEST GAP</p>
          <h4>${r.worst!.month}: ${money(r.worst!.lostRevenue)}</h4>
          <p>Fill ${r.worst!.lostNights.toLocaleString("en-GB")} more room nights in ${r.worst!.month} to reach your target.</p>
        </div>
        <ul class="pkst-bars" aria-label="Occupancy by month against your target">${bars}</ul>
        <p class="pkst-legend">Bar: your occupancy · gold line: your target. Based on a 365-day year.</p>`;
  };
  const onInput = (e: Event) => {
    const el = e.target as HTMLInputElement | HTMLSelectElement;
    if (el.dataset.m !== undefined) state.occupancy[Number(el.dataset.m)] = Number(el.value) || 0;
    else if (el.dataset.k === "currency") state.currency = el.value;
    else if (el.dataset.k) (state as unknown as Record<string, number>)[el.dataset.k] = Number(el.value) || 0;
    render();
  };
  root.addEventListener("input", onInput);
  render();
  const lv = levels(state, render, {
    restore: (saved) => {
      Object.assign(state, JSON.parse(JSON.stringify(saved)));
      syncMonths(root, state);
      render();
    },
  });
  return () => {
    root.removeEventListener("input", onInput);
    lv.destroy();
  };
}
