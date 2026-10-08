import { asset } from "./asset";
import { settings } from "./catalogue";
export const NAVY = "#0B1F3B",
  CREAM = "#F7F3EB",
  GOLD = "#C6A04A";
// Explicitly load all faces used by the canvases, even if no matching DOM text exists.
// A failed font request blocks drawing rather than silently exporting a fallback font.
export async function loadExportFonts() {
  const faces = ["400 48px Fraunces", "400 36px Archivo", '400 24px "IBM Plex Mono"'];
  const loaded = await Promise.all(faces.map((face) => document.fonts.load(face)));
  if (loaded.some((list) => list.length === 0))
    throw new Error("Export fonts could not load. Check your connection and try again.");
  await document.fonts.ready;
}
export function effectiveRemoveFrame(removeFrame: boolean) {
  return removeFrame && !settings.gateFrameRemoval;
}
export async function loadImage(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}
export function cover(
  c: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale,
    sh = h / scale;
  c.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
// Bounded text wrapping also breaks long words/URLs; it never paints into adjacent fields.
export function wrapText(
  c: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
  maxLines = 100,
) {
  const lines: string[] = [];
  for (const para of value.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const chars = word.split("");
      if (line && c.measureText(line + " " + word).width <= width) {
        line += " " + word;
        continue;
      }
      if (line) {
        lines.push(line);
        line = "";
      }
      for (const char of chars) {
        if (c.measureText(line + char).width > width && line) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
    }
    lines.push(line);
  }
  const output = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    let last = output[maxLines - 1] || "";
    while (c.measureText(last + "…").width > width) last = last.slice(0, -1);
    output[maxLines - 1] = last + "…";
  }
  output.forEach((line, i) => c.fillText(line, x, y + i * lineHeight));
  return y + output.length * lineHeight;
}
export async function beginCanvas(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  background = CREAM,
) {
  await loadExportFonts();
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  c.fillStyle = background;
  c.fillRect(0, 0, w, h);
  return c;
}
export async function drawFrame(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  remove: boolean,
) {
  if (effectiveRemoveFrame(remove)) return;
  const size = Math.round(w * 0.045);
  const logo = await loadImage(asset("images/pontikus-logo.png"));
  c.fillStyle = CREAM;
  c.fillRect(0, h - size, w, size);
  c.strokeStyle = "#d9d3c6";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(0, h - size);
  c.lineTo(w, h - size);
  c.stroke();
  c.drawImage(logo, size * 0.45, h - size * 0.82, size * 0.58, size * 0.58);
  c.fillStyle = NAVY;
  c.font = `${Math.round(size * 0.33)}px Archivo`;
  c.fillText("Made with Pontikus · pontikus.com", size * 1.28, h - size * 0.36);
}
export function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
export function pngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encoding failed."))), "image/png"),
  );
}
// The same rendered canvas pages are used for preview, PNG and PDF, with no HTML capture.
export async function downloadCanvases(
  canvases: HTMLCanvasElement[],
  format: "png" | "pdf",
  name: string,
  paper: [number, number],
  papers?: [number, number][],
  labels?: string[],
) {
  if (format === "png") {
    if (canvases.length === 1) {
      saveFile(await pngBlob(canvases[0]), name + ".png");
      return;
    }
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (let i = 0; i < canvases.length; i++)
      zip.file(`${name}-${labels?.[i] || String(i + 1).padStart(2, "0")}.png`, await pngBlob(canvases[i]));
    saveFile(await zip.generateAsync({ type: "blob" }), name + ".zip");
  } else {
    const { jsPDF } = await import("jspdf");
    const first = papers?.[0] || paper;
    const orientation = first[0] > first[1] ? "landscape" : "portrait";
    const pdf = new jsPDF({ orientation, unit: "mm", format: first, compress: true });
    canvases.forEach((canvas, i) => {
      const size = papers?.[i] || paper;
      if (i) pdf.addPage(size, size[0] > size[1] ? "landscape" : "portrait");
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        size[0],
        size[1],
        undefined,
        "FAST",
      );
    });
    pdf.save(name + ".pdf");
  }
}
export async function readPhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Choose a photograph smaller than 20 MB.");
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The photograph could not be read."));
    reader.readAsDataURL(file);
  });
  await loadImage(src);
  return src;
}
