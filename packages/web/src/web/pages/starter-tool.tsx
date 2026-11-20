import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header, Footer } from "../components/brand";
import { tools, audiences } from "../lib/catalogue";
import { asset } from "../lib/asset";
import { isEmbed, usePageTitle } from "../lib/page";
import { widgets } from "../../widgets";

// Hosts one levelled Starter widget. The same widget code is bundled into the
// paste-ready snippets for pontikus.com (see `bun run widgets`).
export default function StarterTool({ slug }: { slug: string }) {
  const tool = tools.find((t) => t.slug === slug)!;
  const ref = useRef<HTMLDivElement>(null);
  usePageTitle(`${tool.name} | Pontikus Boatyard`);
  useEffect(() => {
    if (!ref.current) return;
    // Preview a level on this hub with ?preview=level1 (pontikus.com sets this from the member's plan).
    const preview = new URLSearchParams(window.location.search).get("preview");
    if (preview) {
      ref.current.dataset.audience = tool.audience;
      ref.current.dataset.level = preview;
    }
    return widgets[slug](ref.current, {
      tool: (target) => asset("tools/" + target),
      verify: "https://pontikus.com/join-membership",
    });
  }, [slug]);
  const embed = isEmbed();
  return (
    <>
      <Header compact />
      <main className="maker starter-page">
        {!embed && (
          <Link href={"~" + asset("")} className="text-link back-link">
            <ArrowLeft size={16} />
            All tools
          </Link>
        )}
        <span className="eyebrow">
          {audiences[tool.audience]?.toUpperCase()} / TOOL {String(tool.number).padStart(2, "0")}
        </span>
        <h1>{tool.name}</h1>
        <div ref={ref} />
      </main>
      <Footer />
    </>
  );
}
