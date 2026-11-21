import { riskLonger } from "../web/lib/longer-formats";
import { riskRegister, riskRegisterText, type Risk } from "../web/lib/coastal-experts-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, copyBlock, field, selectField, starterShell } from "./kit";

const five: [string, string][] = [["1", "1 · Rare"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5 · Almost certain"]];
const fiveI: [string, string][] = [["1", "1 · Minor"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5 · Severe"]];

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = {
    title: "",
    rows: [
      { name: "Storm or flood damage to the premises", likelihood: "3", impact: "5" },
      { name: "Coastal erosion affecting access", likelihood: "2", impact: "4" },
      { name: "Loss of a key permit or licence", likelihood: "2", impact: "5" },
      { name: "Seasonal staff shortage", likelihood: "4", impact: "3" },
      { name: "", likelihood: "3", impact: "3" },
      { name: "", likelihood: "3", impact: "3" },
    ],
  };
  const form =
    field("text", "title", "Client or business", state.title, { attrs: { maxlength: 60, placeholder: "Harbourside café" } }) +
    `<p class="pkst-hint" style="margin:-8px 0 14px">Example risks are filled in. Edit them and add up to six.</p>` +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Risk ${i + 1}</legend>
        ${field("text", "name", "Risk", r.name, { row: i, attrs: { maxlength: 80 } })}
        <div class="pkst-row2">${selectField("likelihood", "Likelihood", five, r.likelihood, { row: i })}${selectField("impact", "Impact", fiveI, r.impact, { row: i })}</div>
      </fieldset>`,
      )
      .join("");
  const { result, levels } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Generator",
    intro: "Give a client a clear picture of their coastal risks: score each one for likelihood and impact, and get a ranked register to share.",
    form,
  });
  const render = () => {
    const rows = riskRegister(state.rows.map((r) => ({ name: r.name, likelihood: Number(r.likelihood), impact: Number(r.impact) }) as Risk));
    if (!rows.length) {
      result.innerHTML = `<p class="pkst-eyebrow">RISK REGISTER</p><h3>Add a risk to start.</h3>`;
      return;
    }
    result.innerHTML = `<p class="pkst-eyebrow">TOP RISK</p>
      <h3>${esc(rows[0].name)}</h3>
      <span class="pkst-band ${rows[0].score >= 10 ? "low" : ""}">${rows[0].score} · ${esc(rows[0].rating.toUpperCase())}</span>
      <ol class="pkst-tips">${rows.map((r) => `<li class="${r.score >= 15 ? "is-weak" : ""}"><span>${r.score}</span><b>${esc(r.name)}</b><div>${esc(r.rating)} · likelihood ${r.likelihood}, impact ${r.impact}</div></li>`).join("")}</ol>
      <p class="pkst-eyebrow" style="margin-top:18px">TO SHARE</p>
      ${copyBlock(riskRegisterText(state.title, rows), "Copy the register")}`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render, {
    longer: () => riskLonger(state.title, riskRegister(state.rows.map((r) => ({ name: r.name, likelihood: Number(r.likelihood), impact: Number(r.impact) }) as Risk))),
  });
  return () => {
    unbind();
    lv.destroy();
  };
}
