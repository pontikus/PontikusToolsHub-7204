import { useState } from "react";
import { tools } from "../lib/catalogue";
import { ToolShell, FrameControl } from "../components/tool-shell";
import { CanvasPreview, Field, StyleChoices, useCanvasPages } from "../components/canvas-maker";
import { EntryList, TextList, OptionalPhoto, useExpertDraft } from "../components/expert-fields";
import { PlaceholderLink } from "../components/brand";
import { businessRenderers, businessPaper, type BusinessData } from "../lib/business-canvas";
import { httpsReviewError, reversedRange } from "../lib/business-layout";

export type BusinessKind = keyof typeof businessRenderers;
export function initialBusiness(kind: BusinessKind): BusinessData {
  return {
    kind, business: "[YOUR BUSINESS]", headline: kind === "review-poster" ? "Enjoyed your visit? Tell us." :
      kind === "event-flyer" ? "[YOUR EVENT]" : kind === "offer-board" ? "[YOUR SECTION HEADING]" :
      kind === "job-post" ? "[ROLE TITLE]" : kind === "notice" ? "[YOUR CUSTOMER UPDATE]" : "[YOUR HEADLINE]",
    supporting: "[YOUR SUPPORTING LINE]", url: "", photo: "", format: "a4", style: "classic", removeFrame: false,
    date: "", start: "", end: "", venue: "[VENUE]", description: "[YOUR DESCRIPTION]", price: "[ENTRY OR PRICE]",
    contact: kind === "job-post" ? "[HOW TO APPLY]" : "[YOUR CONTACT OR BOOKING LINE]", currency: "GBP", valid: "",
    rows: [{ name: "[ITEM NAME]", note: "[ITEM NOTE]", price: "[PRICE]" }], location: "[LOCATION]",
    jobType: "Seasonal", requirements: ["[ROLE REQUIREMENT]"], closing: "", noticeType: "Closures", from: "", until: "", cta: "[YOUR CALL TO ACTION]",
  };
}
function Choice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return <label className="field">{label}<select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>
    {options.map(v => <option key={v}>{v}</option>)}
  </select></label>;
}
export default function BusinessMaker({ kind }: { kind: BusinessKind }) {
  const tool = tools.find(t => t.slug === kind)!;
  const { data, update } = useExpertDraft(kind, initialBusiness(kind));
  const [page, setPage] = useState(0);
  const preview = useCanvasPages(data, businessRenderers[kind]);
  const review = kind === "review-poster", event = kind === "event-flyer", offer = kind === "offer-board",
    job = kind === "job-post", notice = kind === "notice", social = kind === "social-kit";
  const field = (key: keyof BusinessData, label: string, maxLength = 60, type = "text", multiline = false) =>
    <Field label={label} value={String(data[key])} maxLength={maxLength} type={type} multiline={multiline}
      onChange={v => update({ [key]: v })} />;
  const urlError = review ? httpsReviewError(data.url) : "";
  const rangeError = (event && reversedRange(data.start, data.end)) || (notice && reversedRange(data.from, data.until)) || (job && reversedRange(data.closing, data.start));
  return <ToolShell title={tool.name} number={tool.number} audience={tool.audience}
    description={social ? "One set of details. Three matching sizes for your business." : tool.promise}
    form={<>
      <StyleChoices value={data.style} onChange={style => update({ style })} />
      {(review || job || notice || social) && field("business", "Business name", 60)}
      {notice && <Choice label="Notice type" value={data.noticeType} options={["Closures", "Hours", "Works", "Weather", "Lost property"]} onChange={noticeType => update({ noticeType })} />}
      {field("headline", event ? "Event title" : offer ? "Section heading" : job ? "Role title" : "Headline", event || job || notice ? 70 : 60)}
      {(review || social) && field("supporting", review ? "Short line" : "Supporting line", 120)}
      {review && <>
        {field("url", "Review link (HTTPS required)", 2048, "url")}
        {urlError && <p className="error" role="alert">{urlError}</p>}
        <p className="sample-note">Scan to test: scan the downloaded QR with your phone and check it opens your review page before printing. No review-platform branding is added.</p>
      </>}
      {event && <>
        {field("date", "Event date", 10, "date")}
        {field("start", "Start time", 5, "time")}{field("end", "End time", 5, "time")}
        {field("venue", "Venue", 80)}{field("description", "Short description", 240, "text", true)}
        {field("price", "Price or entry line", 40)}{field("contact", "Contact or booking line", 100)}
      </>}
      {offer && <>
        <Choice label="Currency" value={data.currency} options={["GBP", "EUR", "USD"]} onChange={currency => update({ currency })} />
        {field("valid", "Valid until (optional)", 10, "date")}
        <EntryList items={data.rows} onChange={rows => update({ rows })} max={10} label="Item"
          note="Up to 10 items. Enter your own descriptions and prices. Longer boards continue on a second page."
          empty={() => ({ name: "", note: "", price: "" })}>
          {(row, i, change) => <>
            <Field label={`Item ${i + 1} name`} value={row.name} maxLength={50} onChange={name => change({ name })} />
            <Field label={`Item ${i + 1} note`} value={row.note} maxLength={70} onChange={note => change({ note })} />
            <Field label={`Item ${i + 1} price`} value={row.price} maxLength={12} onChange={price => change({ price })} />
          </>}
        </EntryList>
      </>}
      {job && <>
        {field("location", "Location", 60)}
        <Choice label="Job type" value={data.jobType} options={["Seasonal", "Part-time", "Full-time", "Contract"]} onChange={jobType => update({ jobType })} />
        {field("start", "Start date", 10, "date")}{field("description", "Short description", 360, "text", true)}
        <TextList items={data.requirements} onChange={requirements => update({ requirements })} max={5} label="Requirement" maxLength={90} />
        {field("contact", "How to apply", 120)}{field("closing", "Closing date (optional)", 10, "date")}
        <p className="sample-note">Check your local employment and equality rules before posting.</p>
      </>}
      {notice && <>
        {field("description", "Message", 400, "text", true)}
        {field("from", "Effective from", 10, "date")}{field("until", "Effective until", 10, "date")}
        {field("contact", "Contact line", 100)}
        <p className="sample-note">For navigation warnings and emergencies, always use the official harbour authority or coastguard channels.</p>
      </>}
      {rangeError && <p className="error" role="alert">{job ? "Closing date is after the start date. Check these dates before posting." : "End is before the start. Check this range before sharing."}</p>}
      {social && field("cta", "Call-to-action line", 50)}
      {(review || event || social) && <OptionalPhoto label={review ? "Optional logo" : "Optional image"} value={data.photo} onChange={photo => update({ photo })} />}
      {!offer && !social && <label className="field">Export format<select aria-label="Export format" value={data.format} onChange={e => update({ format: e.target.value })}>
        <option value="a4">A4 portrait · 1748 × 2480 px</option>
        <option value={review ? "a6" : "social"}>{review ? "A6 table card · 1240 × 1748 px" : "Social portrait · 1080 × 1350 px"}</option>
      </select></label>}
      <FrameControl removed={data.removeFrame} onChange={removeFrame => update({ removeFrame })} />
      <p className="sample-note">Build your place on pontikus.com · <PlaceholderLink className="inline-link">Get verified</PlaceholderLink></p>
    </>}
    preview={<CanvasPreview {...preview} downloadBlocked={!!urlError} title={tool.name}
      name={`pontikus-${kind}${social ? "" : `-${data.format}`}`} paper={businessPaper(data.format)}
      papers={social ? [[216, 216], [216, 270], [216, 384]] : undefined}
      pageLabels={social ? ["1080x1080", "1080x1350", "1080x1920"] : undefined} individual={social}
      page={page} pageChange={setPage} description={social ? "Select a size to preview. The ZIP includes all three PNGs; individual sizes are available below. Story text stays between 250px and 1670px. PDF pages preserve each size’s ratio." : review ? "Scan to test before printing. Downloads are enabled when your HTTPS review link is valid. PDF matches the chosen paper size." : "PNG and PDF use these exact preview pages. Check your details before printing or sharing."} />}
  />;
}