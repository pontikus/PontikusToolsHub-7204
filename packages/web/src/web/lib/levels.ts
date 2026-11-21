// Access levels for the levelled tools. Starter is open to everyone (website registration
// will gate it once the profile integration exists). Levels 1–3 follow the Pontikus
// membership names for each audience, the same names the calculator access codes use.
export type LevelKey = "starter" | "level1" | "level2" | "level3";
export type ToolType =
  | "Assessment"
  | "Calculator"
  | "Planner"
  | "Checker"
  | "Generator"
  | "Maker"
  | "Tracker";

export const levelOrder: LevelKey[] = ["starter", "level1", "level2", "level3"];

export const membershipNames: Record<string, [string, string, string]> = {
  "sea-lovers": ["Drift", "Swell", "Break"],
  "coastal-experts": ["Shore", "Crest", "Tidal"],
  "shoreline-businesses": ["Harbour", "Pier", "Port"],
};

export function levelLabel(audience: string, level: LevelKey) {
  if (level === "starter") return "Starter";
  const index = levelOrder.indexOf(level) - 1;
  const name = membershipNames[audience]?.[index];
  return `Level ${index + 1}${name ? ` · ${name}` : ""}`;
}

// What each level adds, by tool type (from the levelled tools brief).
export const ladderByType: Record<ToolType, Record<LevelKey, string>> = {
  Assessment: {
    starter: "Core score and your weakest area",
    level1: "Full question set, tailored tips, saved results",
    level2: "Visual chart, compare with a previous result, PDF export",
    level3: "Your own questions and a target, branded report (embedding coming soon)",
  },
  Calculator: {
    starter: "One scenario, instant answer",
    level1: "Full inputs, saved scenarios, shareable summary",
    level2: "Side-by-side scenarios, charts, PDF export",
    level3: "Your own fields and defaults, branded output (embedding coming soon)",
  },
  Planner: {
    starter: "A single plan with the essentials",
    level1: "Editable plan, reminders, saved plans",
    level2: "Multiple plans, calendar export, printable PDF",
    level3: "Your own fields and defaults, branded output (shared plans and embedding coming soon)",
  },
  Checker: {
    starter: "A short checklist",
    level1: "Full checklist tailored to your answers, saved",
    level2: "Scored result, history, PDF report",
    level3: "Your own checklist items, branded report (embedding coming soon)",
  },
  Generator: {
    starter: "One draft",
    level1: "Several variations, tone options, saved drafts",
    level2: "Longer formats, export to document, draft history",
    level3: "Your own sign-off and fields, branded export (embedding coming soon)",
  },
  Maker: {
    starter: "Make one item and download it",
    level1: "More templates, saved designs, size options",
    level2: "Every size and format, PDF and bundle export",
    level3: "Your own brand colours and logo, embeddable",
  },
  Tracker: {
    starter: "Track a small number of items",
    level1: "Unlimited items, date reminders, saved",
    level2: "Dashboard view, spreadsheet export, history",
    level3: "Your own field, branded export (shared access and embedding coming soon)",
  },
};

// The level a member can use on a given tool. The pontikus.com page passes the member's
// plan in as data-audience / data-level; plans for another audience stay at Starter.
export function unlockedLevel(
  memberAudience: string | undefined,
  memberLevel: string | undefined,
  toolAudience: string,
  built: LevelKey[],
): LevelKey {
  if (!memberLevel || memberAudience !== toolAudience) return "starter";
  const max = levelOrder.indexOf(memberLevel as LevelKey);
  if (max < 0) return "starter";
  return built.filter((l) => levelOrder.indexOf(l) <= max).sort((a, b) => levelOrder.indexOf(b) - levelOrder.indexOf(a))[0] ?? "starter";
}
