// Level 2 "longer formats" for the Generator tools: the follow-on documents a member
// needs after the first message. Each function takes the tool's own inputs and returns
// labelled blocks of plain text. Gaps are shown as [brackets] for the member to fill.
export type Longer = { label: string; text: string };

const t = (v: unknown, fallback: string) => String(v ?? "").trim() || fallback;
const list = (v: unknown) =>
  String(v ?? "")
    .split(/\n|;/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
const bullets = (items: string[], fallback: string) => (items.length ? items.map((i) => `- ${i}`).join("\n") : `- ${fallback}`);
const money = (c: string, n: number) => c + Math.round(n).toLocaleString("en-GB");

// ---------- Dive Day Plan Builder ----------
export function diveLonger(s: { kind: string; spot: string; date: string; entry: string; maxDepth: number; minutes: number; buddy: string; buddyPhone: string; shoreContact: string }): Longer[] {
  const spot = t(s.spot, "[spot]");
  const free = s.kind === "freedive";
  return [
    {
      label: "Full briefing for you and your buddy",
      text: [
        `DIVE BRIEFING · ${spot} · ${t(s.date, "[date]")}`,
        `Plan\n- In the water at ${t(s.entry, "[time]")}, for up to ${s.minutes} minutes.\n- Maximum depth ${s.maxDepth} m. Whoever reaches a limit first calls the end.`,
        free
          ? `Freediving rules\n- One up, one down: the buddy on the surface watches every dive to the end.\n- Rest at least twice as long as each dive.\n- No hyperventilating before a dive.`
          : `Scuba checks\n- Buddy check before entry: air on, BCD, weights, releases, final OK.\n- Turn the dive at a third of your gas, or at the agreed time, whichever comes first.\n- Safety stop at 5 m for 3 minutes.`,
        `Signals\n- OK, problem, up, and "stay together" agreed on the shore.\n- Lost buddy: search for one minute, then surface and meet at the entry point.`,
        `If something goes wrong\n- Get the casualty out of the water and call the coastguard on 999 or 112, or VHF channel 16.\n- Shore contact: ${t(s.shoreContact, "[name and number]")}.`,
      ].join("\n\n"),
    },
    {
      label: "Message to your shore contact",
      text: `Hi${s.shoreContact.trim() ? ` ${s.shoreContact.trim().split(" ")[0]}` : ""},\n\nI'm ${free ? "freediving" : "diving"} at ${spot} on ${t(s.date, "[date]")} with ${t(s.buddy, "[buddy]")}${s.buddyPhone.trim() ? ` (${s.buddyPhone.trim()})` : ""}. We're in the water at ${t(s.entry, "[time]")} and plan to be out within ${s.minutes} minutes.\n\nI'll text you when we're out. If you haven't heard from me an hour after that, please call me, then call the coastguard on 999 and tell them where we are.\n\nThanks`,
    },
  ];
}

// ---------- Client Brief Builder ----------
export function briefLonger(s: { client: string; goal: string; scope: string; deliverables: string; exclusions: string; timeline: string; approver: string }): Longer[] {
  const client = t(s.client, "[client]");
  return [
    {
      label: "Kick-off email to the client",
      text: `Hi ${client},\n\nThanks for the time today. Here's what we agreed, so we're both working from the same page.\n\nThe goal\n${t(s.goal, "[goal]")}\n\nWhat I'll deliver\n${bullets(list(s.deliverables), "[deliverable]")}\n\nNot included\n${bullets(list(s.exclusions), "[anything out of scope]")}\n\nTimeline\n${t(s.timeline, "[dates]")}\n\nSign-off\n${t(s.approver, "[name]")} approves each stage. Anything outside the list above I'll quote separately before starting.\n\nCould you reply to confirm this is right?\n\nThanks`,
    },
    {
      label: "Change request note",
      text: `CHANGE REQUEST · ${client}\n\nRequested by: [name]\nDate: [date]\n\nWhat's changing\n[Describe the change]\n\nWhy it's outside the agreed scope\nThe agreed scope was: ${t(s.scope, "[scope]")}\n\nEffect on time and cost\n- Extra time: [days]\n- Extra cost: [amount]\n- New delivery date: [date]\n\nApproved by ${t(s.approver, "[name]")}: ________  Date: ________`,
    },
  ];
}

// ---------- Matter Intake Builder ----------
export function intakeLonger(s: { client: string; contact: string; matterType: string; issue: string; jurisdiction: string; deadline: string; otherParties: string; documents: string[] }): Longer[] {
  const client = t(s.client, "[client]");
  return [
    {
      label: "Email asking the client for documents",
      text: `Dear ${client},\n\nThank you for getting in touch about ${t(s.issue, "your matter")}. To get started, please send the following:\n\n${bullets(s.documents ?? [], "[documents]")}\n\n${s.deadline.trim() ? `There is a deadline of ${s.deadline.trim()}, so it would help to have these as soon as you can.\n\n` : ""}Before we go further I'll run a conflict check against${s.otherParties.trim() ? ` ${s.otherParties.trim()}` : " the other parties"}, and I'll confirm my terms in writing.\n\nKind regards`,
    },
    {
      label: "File note",
      text: `FILE NOTE · ${client}\n\nDate of first contact: [date]\nContact: ${t(s.contact, "[contact details]")}\nType of matter: ${t(s.matterType, "[type]")}\nWhere: ${t(s.jurisdiction, "[jurisdiction]")}\nKey deadline: ${t(s.deadline, "none given")}\nOther parties: ${t(s.otherParties, "none given")}\n\nSummary\n${t(s.issue, "[summary]")}\n\nConflict check: [clear / issue]  Done by: [initials]\nTerms sent: [date]\nNext step: [action and date]`,
    },
  ];
}

// ---------- Risk Register Builder ----------
type Rated = { name: string; likelihood: number; impact: number; score: number; rating: string };
const review = (score: number) => (score >= 15 ? "monthly" : score >= 8 ? "every quarter" : "every six months");
export function riskLonger(title: string, rows: Rated[]): Longer[] {
  if (!rows.length) return [];
  return [
    {
      label: "Risk report with actions",
      text: [
        `RISK REPORT · ${title.trim() || "Coastal business"}`,
        `Summary\n${rows.length} risk${rows.length === 1 ? "" : "s"} scored. The highest is "${rows[0].name}" at ${rows[0].score} out of 25.`,
        ...rows.map(
          (r, i) =>
            `${i + 1}. ${r.name} (${r.rating}, ${r.score}/25: likelihood ${r.likelihood}, impact ${r.impact})\n- Owner: [name]\n- What we do now: [current control]\n- Next action: [action] by [date]\n- Review ${review(r.score)}`,
        ),
        `Sign-off\nReviewed by: [name]  Date: [date]  Next full review: [date]`,
      ].join("\n\n"),
    },
  ];
}

// ---------- Group Booking Quote Builder ----------
export function quoteLonger(s: { business: string; client: string; date: string; route: string; groupSize: number; depositPct: number; validDays: number; currency: string }, total: number, deposit: number): Longer[] {
  const biz = t(s.business, "[your business]");
  return [
    {
      label: "Quote email with terms",
      text: `Hi${s.client.trim() ? ` ${s.client.trim()}` : ""},\n\nThanks for asking about a group booking. Here is your quote for ${s.groupSize} guests${s.date ? ` on ${s.date}` : ""}${s.route.trim() ? `: ${s.route.trim()}` : ""}.\n\nTotal: ${money(s.currency, total)}\nDeposit to secure the date: ${money(s.currency, deposit)} (${s.depositPct}%)\n\nTerms\n- The quote is held for ${s.validDays} days.\n- The balance is due [number] days before the trip.\n- Final numbers by [date]. Fewer guests after that are charged at the quoted rate.\n- If we cancel for weather or safety, you can move to another date or have your money back.\n- If you cancel: [your cancellation terms].\n\nReply to this email to book, and I'll send the deposit details.\n\nThanks,\n${biz}`,
    },
    {
      label: "Follow-up a few days later",
      text: `Hi${s.client.trim() ? ` ${s.client.trim()}` : ""},\n\nJust checking you received the quote for ${s.groupSize} guests${s.date ? ` on ${s.date}` : ""}. The date is held until [date]. Happy to adjust the plan or answer any questions.\n\nThanks,\n${biz}`,
    },
  ];
}

// ---------- Guest Welcome Message Generator ----------
export function welcomeLonger(s: { property: string; guest: string; arrival: string; checkIn: string; checkOut: string; host: string; contact: string }): Longer[] {
  const name = t(s.guest, "there");
  const place = t(s.property, "the property");
  const host = t(s.host, "[your name]");
  return [
    {
      label: "Email a week before arrival",
      text: `Hi ${name},\n\nWe're looking forward to having you at ${place}${s.arrival.trim() ? ` on ${s.arrival.trim()}` : ""}. Check-in is from ${t(s.checkIn, "[time]")}.\n\nA few days before you arrive I'll send the door code and directions. In the meantime, let me know your rough arrival time and if there's anything that would make the stay easier.\n\nSee you soon,\n${host}`,
    },
    {
      label: "Check-out reminder",
      text: `Hi ${name},\n\nHope you've had a lovely stay. A reminder that check-out is by ${t(s.checkOut, "[time]")} tomorrow. Please leave the keys where you found them and close the windows on your way out.\n\nSafe travels,\n${host}`,
    },
    {
      label: "Thank you and review request",
      text: `Hi ${name},\n\nThank you for staying at ${place}. If you have a minute, a short review would help other guests find us: [review link].\n\nIf anything wasn't right, please tell me directly${s.contact.trim() ? ` on ${s.contact.trim()}` : ""} so I can put it right for next time.\n\nThanks again,\n${host}`,
    },
  ];
}

// ---------- Impact Pitch Pack Builder ----------
export function pitchLonger(s: { project: string; org: string; problem: string; outcomes: string; audience: string; ask: string; timeframe: string; measure: string }): Longer[] {
  const project = t(s.project, "[project]");
  return [
    {
      label: "One-page proposal",
      text: [
        `${project.toUpperCase()}${s.org.trim() ? ` · ${s.org.trim()}` : ""}`,
        `The problem\n${t(s.problem, "[problem]")}`,
        `What we will do\n[Two or three sentences on the work]`,
        `What will change\n${bullets(list(s.outcomes), "[outcome]")}`,
        `How we'll show it\n${t(s.measure, "[how you will measure it]")}, reported ${s.timeframe.trim() ? `over ${s.timeframe.trim()}` : "at the end"}.`,
        `What we're asking for\n${t(s.ask, "[ask]")}`,
        `What you get\n- Your name on [where]\n- A short impact report at the end\n- [Anything else you offer]`,
        `Contact\n[Name, email, phone]`,
      ].join("\n\n"),
    },
    {
      label: "Follow-up email",
      text: `Hi [name],\n\nI sent over our proposal for ${project} last week. I'd welcome fifteen minutes to talk it through and answer questions. Would [day] or [day] suit?\n\nThanks,\n[Your name]${s.org.trim() ? `\n${s.org.trim()}` : ""}`,
    },
  ];
}

// ---------- Retainer Proposal Builder ----------
export function retainerLonger(s: { client: string; agency: string; fee: number; term: number; notice: number; currency: string; hours: number }): Longer[] {
  const client = t(s.client, "[client]");
  const agency = t(s.agency, "[your business]");
  return [
    {
      label: "Terms to attach",
      text: [
        `RETAINER TERMS · ${agency} and ${client}`,
        `1. Fee\n${money(s.currency, s.fee)} a month, invoiced on the 1st and payable within [14] days.`,
        `2. Term\nA minimum of ${s.term} months from [start date], then rolling month to month. Either side can end it with ${s.notice} days' notice in writing.`,
        `3. Hours\n${s.hours ? `Up to ${s.hours} hours a month. ` : ""}Unused hours do not roll over. Extra work is agreed in writing before it starts.`,
        `4. Approvals\nThe client names one person to approve work. Feedback within [5] working days keeps the schedule.`,
        `5. Ownership\nFinished work belongs to the client once paid for. ${agency} may show it in its portfolio unless asked not to.`,
        `Signed for ${client}: ________  Date: ______\nSigned for ${agency}: ________  Date: ______`,
      ].join("\n\n"),
    },
    {
      label: "Cover email",
      text: `Hi ${client},\n\nAs promised, here's the retainer proposal and terms. In short: ${money(s.currency, s.fee)} a month for a minimum of ${s.term} months, with a monthly report and planning call.\n\nIf it looks right, reply and I'll send the agreement to sign. Happy to talk anything through first.\n\nThanks,\n${agency}`,
    },
  ];
}

// ---------- Trade Partner Outreach Generator ----------
export function outreachLonger(s: { event: string; date: string; place: string; audience: string; gain: string; sender: string }): Longer[] {
  const ev = t(s.event, "our event");
  const sender = t(s.sender, "[your name and business]");
  return [
    {
      label: "Follow-up a week later",
      text: `Hi [name],\n\nFollowing up on my note about ${ev}${s.date.trim() ? ` on ${s.date.trim()}` : ""}. We'd love to have you involved. Even a poster in the window would help.\n\nCould you let me know by [date]? I can drop round with details.\n\nThanks,\n${sender}`,
    },
    {
      label: "Partner info sheet",
      text: [
        `${ev.toUpperCase()} · PARTNER INFORMATION`,
        `When and where\n${t(s.date, "[date]")}, ${t(s.place, "[place]")}`,
        `Who's coming\n${t(s.audience, "[audience]")}`,
        `What partners get\n${t(s.gain, "[what partners get]")}`,
        `What we ask\n- Share the event with your customers\n- Put up a poster or flyer\n- [Optional: an offer for ticket holders]`,
        `Key dates\n- Reply by: [date]\n- Posters delivered: [date]\n- Event day: ${t(s.date, "[date]")}`,
        `Contact\n${sender}`,
      ].join("\n\n"),
    },
  ];
}
