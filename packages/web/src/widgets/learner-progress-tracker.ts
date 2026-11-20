import { learnerProgress } from "../web/lib/coastal-experts-tools";
import { STARTER_TRACKER_LIMIT } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { loadList, saveList, starterShell } from "./kit";

type Saved = { skills: string[]; learners: { name: string; done: string[] }[] };
const KEY = "pkst-learner-progress";
const SKILLS = 8;

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const loaded = loadList<Saved>(KEY)[0];
  const data: Saved = loaded ?? { skills: ["Knots", "Capsize drill", "Navigation", "Radio", "Man overboard", "", "", ""], learners: [] };
  while (data.skills.length < SKILLS) data.skills.push("");
  let note = "";
  const { form, result } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Tracker",
    intro: "Keep track of where each learner is up to. List the skills on your course, add your learners, and tick off each skill as they reach it.",
    form: "",
    privacy: "Your learners are saved only in this browser. Nothing is uploaded or saved to a server.",
  });
  const save = () => (saveList(KEY, [data]) ? "" : "This browser is blocking storage, so the list will be lost when you leave the page.");
  const skills = () => data.skills.map((s) => s.trim()).filter(Boolean);
  const drawForm = () => {
    form.innerHTML = `<fieldset class="pkst-field"><legend class="pkst-label">Skills on your course (up to ${SKILLS})</legend>
      <div class="pkst-row2">${data.skills.map((s, i) => `<input type="text" maxlength="30" data-skill="${i}" value="${esc(s)}" aria-label="Skill ${i + 1}">`).join("")}</div></fieldset>
      <label class="pkst-field"><span class="pkst-label">Add a learner</span><input type="text" maxlength="40" data-new placeholder="Name"></label>
      <button type="button" class="pkst-button" data-add>Add learner</button>`;
  };
  const render = () => {
    const list = skills();
    const r = learnerProgress(list, data.learners);
    const grid = data.learners
      .map(
        (l, li) => `<li><div class="pkst-learner"><b>${esc(l.name)}</b><span>${r.rows.find((x) => x.name === l.name)?.pct ?? 0}%</span><button type="button" class="pkst-small" data-del="${li}">Remove</button></div>
        <div class="pkst-choices">${list
          .map((s) => `<button type="button" class="pkst-choice${l.done.includes(s) ? " is-on" : ""}" data-l="${li}" data-s="${esc(s)}" aria-pressed="${l.done.includes(s)}">${esc(s)}</button>`)
          .join("")}</div></li>`,
      )
      .join("");
    const behind = r.rows[0];
    result.innerHTML = data.learners.length
      ? `<p class="pkst-eyebrow">NEEDS MOST HELP</p>
        <h3>${esc(behind.name)}</h3><p>${behind.pct}% of skills done${behind.next ? `. Next: ${esc(behind.next)}.` : "."}</p>
        ${r.weakest && r.weakest.count < data.learners.length ? `<div class="pkst-fix"><p class="pkst-eyebrow">LEAST COVERED SKILL</p><p>${esc(r.weakest.skill)}: ${r.weakest.count} of ${data.learners.length} learners. Plan it into your next session.</p></div>` : ""}
        <p class="pkst-eyebrow" style="margin-top:18px">TICK OFF SKILLS · ${data.learners.length} OF ${STARTER_TRACKER_LIMIT} LEARNERS</p>
        <ul class="pkst-learners">${grid}</ul>
        ${note ? `<p class="pkst-note" role="status">${esc(note)}</p>` : ""}`
      : `<p class="pkst-eyebrow">YOUR LEARNERS</p><h3>Add your first learner.</h3><p>Then tick off skills as they reach them.</p>${note ? `<p class="pkst-note" role="status">${esc(note)}</p>` : ""}`;
  };
  const onInput = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset.skill === undefined) return;
    const i = Number(el.dataset.skill);
    const old = data.skills[i].trim();
    data.skills[i] = el.value;
    if (old) data.learners.forEach((l) => (l.done = l.done.map((s) => (s === old ? el.value.trim() : s)).filter(Boolean)));
    note = save();
    render();
  };
  const onClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!btn || !root.contains(btn)) return;
    if (btn.dataset.add !== undefined) {
      const input = form.querySelector<HTMLInputElement>("input[data-new]")!;
      const name = input.value.trim();
      if (!name) note = "Type a name first.";
      else if (data.learners.length >= STARTER_TRACKER_LIMIT) note = `Starter keeps ${STARTER_TRACKER_LIMIT} learners. Remove one to add another.`;
      else {
        data.learners.push({ name, done: [] });
        input.value = "";
        note = save() || `${name} added.`;
      }
    } else if (btn.dataset.del !== undefined) {
      data.learners.splice(Number(btn.dataset.del), 1);
      note = save() || "Removed.";
    } else if (btn.dataset.l !== undefined) {
      const l = data.learners[Number(btn.dataset.l)];
      const s = btn.dataset.s!;
      l.done = l.done.includes(s) ? l.done.filter((x) => x !== s) : [...l.done, s];
      note = save();
    } else return;
    render();
  };
  root.addEventListener("input", onInput);
  root.addEventListener("click", onClick);
  drawForm();
  render();
  return () => {
    root.removeEventListener("input", onInput);
    root.removeEventListener("click", onClick);
  };
}
