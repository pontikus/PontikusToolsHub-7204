import { useEffect, useState } from "react";
import { Download, ImagePlus } from "lucide-react";
import { useFrameGate } from "../lib/frame-gate";
import { downloadCanvases, readPhoto } from "../lib/canvas-utils";

export function FormHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="form-heading">
      <span className="step-label">{step}</span>
      <h2>{title}</h2>
    </div>
  );
}
export function StyleChoices({
  value,
  onChange,
}: {
  value: string;
  onChange: (style: string) => void;
}) {
  return (
    <>
      <FormHeading step="01" title="Choose a style" />
      <div className="layout-grid">
        {[
          ["classic", "Classic", "Cream paper and fine rules."],
          ["navy", "Midnight", "Deep navy, considered gold."],
          ["minimal", "Studio", "Simple, light and spacious."],
        ].map(([id, name, description]) => (
          <button
            key={id}
            className={"layout-choice " + (id === value ? "selected" : "")}
            onClick={() => onChange(id)}
            aria-pressed={id === value}
          >
            <span
              className={
                "layout-mini " +
                (id === "navy" ? "split" : id === "minimal" ? "bordered" : "classic")
              }
            >
              <span />
              <i />
            </span>
            <strong>{name}</strong>
            <small>{description}</small>
          </button>
        ))}
      </div>
      <FormHeading step="02" title="Add your details" />
    </>
  );
}
export function Field({
  label,
  value,
  onChange,
  maxLength = 80,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <label className="field">
      {label}
      {multiline ? (
        <textarea
          aria-label={label}
          value={value}
          maxLength={maxLength}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          type={type}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
export function PhotoUpload({
  label = "Photograph",
  onPhoto,
  multiple = false,
}: {
  label?: string;
  onPhoto: (photos: string[]) => void;
  multiple?: boolean;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="photo-upload">
      <label className="field">
        {label}
        <span className="photo-upload-label">
          <ImagePlus size={20} />
          Choose {multiple ? "photographs" : "a photograph"}
          <input
            aria-label={label}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            disabled={busy}
            onChange={async (e) => {
              setError("");
              setBusy(true);
              try {
                const files = Array.from(e.target.files || []);
                if (files.length > (multiple ? 3 : 1))
                  throw new Error("Choose up to three photographs at a time.");
                onPhoto(await Promise.all(files.map(readPhoto)));
              } catch (err) {
                setError(err instanceof Error ? err.message : "This photograph could not be read.");
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </span>
      </label>
      <p className="sample-note">
        {busy ? "Reading locally…" : "JPG, PNG or WebP · up to 20 MB each · stays in your browser."}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// One render result powers the visible preview and every download. Cancellation
// prevents a slow image load from painting an older draft over newer edits.
export function useCanvasPages<T>(data: T, render: (data: T) => Promise<HTMLCanvasElement[]>) {
  const gate = useFrameGate();
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError("");
    render(data)
      .then((result) => {
        if (!cancelled) {
          setPages(result);
          setReady(true);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Preview could not load.");
      });
    return () => {
      cancelled = true;
    };
  }, [data, render, gate]);
  return { pages, ready, error };
}
export function CanvasPreview({
  pages,
  ready,
  error,
  title,
  name,
  paper,
  page,
  pageChange,
  description,
  pageLabels,
  papers,
  individual = false,
  downloadBlocked = false,
}: {
  pages: HTMLCanvasElement[];
  ready: boolean;
  error: string;
  title: string;
  name: string;
  paper: [number, number];
  page: number;
  pageChange: (index: number) => void;
  description: string;
  pageLabels?: string[];
  papers?: [number, number][];
  individual?: boolean;
  downloadBlocked?: boolean;
}) {
  const [busy, setBusy] = useState(""),
    [notice, setNotice] = useState(""),
    [downloadError, setDownloadError] = useState("");
  const current = Math.min(page, Math.max(0, pages.length - 1));
  async function download(format: "png" | "pdf") {
    setBusy(format);
    setNotice("");
    setDownloadError("");
    try {
      await downloadCanvases(pages, format, name, paper, papers, pageLabels);
      setNotice(
        `Downloaded ${pages.length} ${pages.length === 1 ? "page" : "pages"} as ${format === "png" ? (pages.length === 1 ? "PNG" : "PNGs in a ZIP") : "PDF"}.`,
      );
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="preview-heading">
        <span className="eyebrow">03 / LIVE PREVIEW</span>
        <span className="mono">
          <span className="dot" />
          {ready ? "UP TO DATE" : "RENDERING"}
        </span>
      </div>
      {pages.length > 1 && (
        <div className="page-tabs" aria-label="Preview page">
          {pages.map((_, i) => (
            <button
              key={i}
              className={i === current ? "active" : ""}
              onClick={() => pageChange(i)}
              aria-pressed={i === current}
            >
              {pageLabels?.[i] || `Page ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <div className="canvas-stage">
        <canvas
          aria-label={`${title}, preview page ${current + 1}`}
          ref={(node) => {
            if (node && pages[current]) {
              node.width = pages[current].width;
              node.height = pages[current].height;
              node.getContext("2d")!.drawImage(pages[current], 0, 0);
            }
          }}
        >
          {title} live preview
        </canvas>
      </div>
      <div className="preview-meta">
        <span>
          {(papers?.[current] || paper)[0]} × {(papers?.[current] || paper)[1]} mm
        </span>
        <span>
          {pages[current]
            ? `${pages[current].width} × ${pages[current].height} px`
            : "Preparing canvas"}
        </span>
      </div>
      <p className="preview-tip">{description}</p>
      <div className="download-panel">
        <FormHeading step="04" title="Make it yours to keep." />
        <p>Download the exact canvas shown in your preview. Every page is included.</p>
        <div className="download-buttons">
          <button className="button" disabled={!ready || downloadBlocked || !!busy} onClick={() => download("png")}>
            <Download size={17} />
            {busy === "png"
              ? "Preparing PNG…"
              : pages.length > 1
                ? "Download PNGs"
                : "Download PNG"}
          </button>
          <button
            className="button outline"
            disabled={!ready || downloadBlocked || !!busy}
            onClick={() => download("pdf")}
          >
            <Download size={17} />
            {busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        {individual && (
          <div className="download-buttons">
            {pages.map((canvas, i) => (
              <button className="button outline" key={i} disabled={!ready || downloadBlocked || !!busy}
                onClick={async () => {
                  setBusy(`individual-${i}`);
                  setDownloadError("");
                  try {
                    await downloadCanvases([canvas], "png", `${name}-${pageLabels?.[i] || i + 1}`, papers?.[i] || paper);
                    setNotice(`Downloaded ${pageLabels?.[i] || `page ${i + 1}`} as PNG.`);
                  } catch (e) { setDownloadError(e instanceof Error ? e.message : "Download failed."); }
                  finally { setBusy(""); }
                }}>
                Download {pageLabels?.[i] || `page ${i + 1}`} PNG
              </button>
            ))}
          </div>
        )}
        {notice && (
          <output aria-live="polite" className="success">
            {notice}
          </output>
        )}
        {(error || downloadError) && (
          <p className="error" role="alert">
            {error || downloadError}
          </p>
        )}
      </div>
      <p className="sample-note">
        Nothing is uploaded. Refreshing clears your draft and photographs.
      </p>
    </>
  );
}
