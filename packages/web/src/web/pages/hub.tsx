import { asset } from "../lib/asset";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Anchor,
  Camera,
  BookOpen,
  Stamp,
  Image,
  FileText,
  BadgeCheck,
  CalendarDays,
  QrCode,
  Megaphone,
  Tag,
  BriefcaseBusiness,
  ClipboardList,
  Layers,
  ShieldCheck,
  Clock3,
  Globe2,
  SlidersHorizontal,
  PenLine,
  Compass,
  ListChecks,
  Gauge,
  BedDouble,
  Sun,
  Aperture,
  Backpack,
  Caravan,
  MapPin,
  NotebookPen,
  Recycle,
  RotateCcw,
  Ruler,
  Sunset,
  Thermometer,
  Trash2,
  Wallet,
  Waves,
} from "lucide-react";
import { Header, Footer, PlaceholderLink } from "../components/brand";
import { tools } from "../lib/catalogue";
import { usePageTitle } from "../lib/page";

const icons = [
  Camera,
  Stamp,
  BookOpen,
  Image,
  FileText,
  Tag,
  BadgeCheck,
  CalendarDays,
  QrCode,
  Megaphone,
  Tag,
  BriefcaseBusiness,
  ClipboardList,
  Layers,
  Compass,
  ListChecks,
  Gauge,
  BedDouble,
  Sun,
  Waves,
  Ruler,
  Thermometer,
  RotateCcw,
  Backpack,
  Sunset,
  Aperture,
  NotebookPen,
  MapPin,
  Wallet,
  Caravan,
  Trash2,
  Recycle,
];
const groups = [
  {
    id: "sea-lovers",
    name: "Sea Lovers",
    title: "For the moments worth keeping.",
    description:
      "Small keepsakes for big horizons. Make something personal from your time by the sea.",
  },
  {
    id: "coastal-experts",
    name: "Coastal Experts",
    title: "Let your expertise speak.",
    description:
      "Practical tools to present your work, share your credentials and find your next opportunity.",
  },
  {
    id: "shoreline-businesses",
    name: "Shoreline Businesses",
    title: "Good things deserve to be seen.",
    description:
      "From the harbour window to the social feed. Put your business, events and offers on the map.",
  },
];
export default function Hub() {
  usePageTitle("Pontikus Boatyard | Maker tools for the coast");
  const liveCount = tools.filter((tool) => tool.status === "Live").length;
  const buildCount = tools.filter((tool) => tool.status === "In build").length;
  const plannedCount = tools.filter((tool) => tool.status === "Planned").length;
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="gold-line" /> PONTIKUS BOATYARD
            </span>
            <h1>
              A workshop
              <br />
              for the coast.
              <br />
              <em>
                Make it, share it,
                <br />
                keep it.
              </em>
            </h1>
            <p>
              Thoughtful little tools for sea lovers, coastal experts and shoreline businesses. Made
              by you. Made for the coast.
            </p>
            <div className="hero-actions">
              <a href={asset("#sea-lovers")} className="button">
                Explore the tools <ArrowRight size={18} />
              </a>
              <PlaceholderLink className="text-link">
                Get verified for $1, fully credited <ArrowUpRight size={15} />
              </PlaceholderLink>
            </div>
            <div className="hero-footnote">
              <span className="dot" /> IN YOUR BROWSER. AT YOUR OWN PACE.
            </div>
          </div>
          <div className="hero-art">
            <div className="contours" />
            <div className="postcard-decoration back-decoration">
              <span className="mono">POSTCARD / FROM THE COAST</span>
              <span className="postmark">
                PONTIKUS
                <br />
                BY THE SEA
              </span>
              <div className="address-decoration" />
            </div>
            <div className="postcard-decoration photo-decoration">
              <img
                src={asset("images/coast.jpg")}
                alt="Boats in turquoise water beside a coastal town"
              />
              <div>
                <span className="mono">A LITTLE PIECE OF THE COAST</span>
                <span>Wish you were here.</span>
                <img src={asset("images/pontikus-logo.png")} alt="Pontikus" />
              </div>
            </div>
            <div className="art-note">
              <PenLine size={20} />
              <span>Your coast. Your story.</span>
            </div>
            <div className="hero-seal">
              <Anchor size={23} />
              <span>
                MADE FOR
                <br />
                THE COAST
              </span>
            </div>
          </div>
        </section>
        <div className="workshop-strip">
          <span className="mono">THE WORKSHOP, AT A GLANCE</span>
          <span>{tools.length} tools. Three ways to belong.</span>
          <span className="mono">
            <span className="dot" /> {liveCount} LIVE
            {buildCount > 0 ? ` · ${buildCount} IN BUILD` : ""}
            {plannedCount > 0 ? ` · ${plannedCount} PLANNED` : ""}
          </span>
        </div>
        <div className="catalogue">
          {groups.map((group, i) => (
            <section className="tool-section" id={group.id} key={group.id}>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    0{i + 1} / {group.name.toUpperCase()}
                  </span>
                  <h2>{group.title}</h2>
                  <p>{group.description}</p>
                </div>
                <span className="section-count mono">
                  {tools.filter((t) => t.audience === group.id).length} TOOLS{" "}
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <div className="tool-grid">
                {tools
                  .filter((t) => t.audience === group.id)
                  .map((tool) => {
                    const Icon = icons[tool.number - 1];
                    return (
                      <Link
                        href={"~" + asset("tools/" + tool.slug)}
                        key={tool.slug}
                        className={"tool-card " + (tool.status === "Live" ? "live-card" : "")}
                      >
                        <div className="card-top">
                          <span className="tool-icon">
                            <Icon size={24} strokeWidth={1.5} />
                          </span>
                          <span className={"status " + tool.status.toLowerCase().replace(" ", "-")}>
                            <span />
                            {tool.status}
                          </span>
                        </div>
                        <span className="tool-number mono">
                          TOOL {String(tool.number).padStart(2, "0")}
                          {tool.toolType ? ` · ${tool.toolType.toUpperCase()} · ${tool.level?.toUpperCase()}` : ""}
                        </span>
                        <h3>{tool.name}</h3>
                        <p>{tool.promise}</p>
                        <div className="card-bottom">
                          <span>Open tool</span>
                          <ArrowRight size={19} />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
        <section className="principles">
          {[
            [ShieldCheck, "Vetted and curated", "Considered tools, not clutter."],
            [Clock3, "Quick to complete", "Less setup. More making."],
            [Globe2, "Coast-aware", "18 regions. Four continents."],
            [SlidersHorizontal, "Fitted to your tier", "A place for every coastal role."],
          ].map(([Icon, title, description]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div key={String(title)}>
                <I size={24} strokeWidth={1.4} />
                <h3>{String(title)}</h3>
                <p>{String(description)}</p>
              </div>
            );
          })}
        </section>
        <section className="next-up">
          <div>
            <span className="eyebrow">ON THE HORIZON</span>
            <h2>What should come aboard next?</h2>
            <p>
              The boatyard is taking shape. Tell us which tool would make a difference to your
              coast.
            </p>
          </div>
          <PlaceholderLink kind="suggestion" className="button outline">
            Suggest a tool <ArrowUpRight size={18} />
          </PlaceholderLink>
        </section>
        <section className="closing">
          <Anchor size={34} strokeWidth={1.2} />
          <h2>
            Every tool leads somewhere.
            <br />
            <em>Make it your verified place on the coast.</em>
          </h2>
          <PlaceholderLink className="button gold">
            Get verified <ArrowUpRight size={18} />
          </PlaceholderLink>
          <span className="mono">YOUR PLACE. YOUR PEOPLE. YOUR COAST.</span>
        </section>
      </main>
      <Footer />
    </>
  );
}
