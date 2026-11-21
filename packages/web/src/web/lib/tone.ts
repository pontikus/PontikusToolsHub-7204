// Tone options for the Generator tools (Level 1). Each tool writes its message in a
// friendly voice; these rewrite it as formal or as a short, direct version.
export type Tone = "friendly" | "formal" | "short";
export const toneOptions: [Tone, string][] = [
  ["friendly", "Friendly"],
  ["formal", "Formal"],
  ["short", "Short and direct"],
];

const CONTRACTIONS: [RegExp, string][] = [
  [/\bI'm\b/g, "I am"],
  [/\bI've\b/g, "I have"],
  [/\bI'll\b/g, "I will"],
  [/\bI'd\b/g, "I would"],
  [/\bwe're\b/gi, "we are"],
  [/\bwe've\b/gi, "we have"],
  [/\bwe'll\b/gi, "we will"],
  [/\byou're\b/gi, "you are"],
  [/\byou've\b/gi, "you have"],
  [/\byou'll\b/gi, "you will"],
  [/\byou'd\b/gi, "you would"],
  [/\bit's\b/gi, "it is"],
  [/\bthat's\b/gi, "that is"],
  [/\bthere's\b/gi, "there is"],
  [/\bhere's\b/gi, "here is"],
  [/\blet's\b/gi, "let us"],
  [/\bcan't\b/gi, "cannot"],
  [/\bwon't\b/gi, "will not"],
  [/\bdon't\b/gi, "do not"],
  [/\bdoesn't\b/gi, "does not"],
  [/\bdidn't\b/gi, "did not"],
  [/\bisn't\b/gi, "is not"],
  [/\baren't\b/gi, "are not"],
  [/\bwasn't\b/gi, "was not"],
  [/\bcouldn't\b/gi, "could not"],
  [/\bwouldn't\b/gi, "would not"],
  [/\bshouldn't\b/gi, "should not"],
];

// Keeps the case of the first letter of what it replaces ("Don't" -> "Do not").
const keepCase = (match: string, out: string) => (match[0] === match[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out);

function formal(text: string) {
  let t = text;
  for (const [re, out] of CONTRACTIONS) t = t.replace(re, (m) => keepCase(m, out));
  return t
    .replace(/^(Hi|Hello|Hey)\b[ ,]*(.*?)[,!]?$/m, (_m, _g, name: string) => `Dear ${name.trim() || "all"},`)
    .replace(/^(Thanks|Thank you|Cheers|Best|See you soon|Speak soon|All the best)[,!.]*$/im, "Kind regards,")
    .replace(/!+/g, ".")
    .replace(/\.\.+/g, ".")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]️?\s?/gu, "");
}

const firstSentence = (p: string) => {
  const m = p.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (m ? m[0] : p).trim();
};

// Short: greeting, the first sentence of each paragraph, every list line and the sign-off.
function short(text: string) {
  const paras = text.split(/\n{2,}/);
  return paras
    .map((p, i) => {
      const lines = p.split("\n");
      if (i === 0 || i === paras.length - 1 || lines.length > 1) return p;
      return firstSentence(p);
    })
    .join("\n\n");
}

export function toneText(text: string, tone: Tone | string) {
  if (tone === "formal") return formal(text);
  if (tone === "short") return short(text);
  return text;
}
