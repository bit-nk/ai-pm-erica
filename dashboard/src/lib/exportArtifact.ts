/**
 * Dependency-free export of an artifact's Markdown to Word (.doc, an HTML blob
 * Word opens natively) or PDF (print dialog -> "Save as PDF").
 *
 * Both render a proper document: a title header, a linked table of contents
 * (anchors jump to the matching heading), and consistent fonts -
 * 14pt main headers, 13pt sub-headers, 11pt body text.
 */

const safeFile = (s: string) => s.trim().replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "") || "artifact";
const slug = (s: string) => s.toLowerCase().trim().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

interface Heading { level: number; text: string; id: string }

/** Markdown -> HTML, tagging headings with ids and collecting them for a ToC. */
function render(markdown: string): { body: string; headings: Heading[] } {
  const lines = markdown.split("\n");
  const out: string[] = [];
  const headings: Heading[] = [];
  let inList = false;
  let table: string[][] = [];
  const ids = new Set<string>();

  const uniqueId = (text: string) => {
    let id = slug(text) || "section";
    let n = 2;
    while (ids.has(id)) id = `${slug(text)}-${n++}`;
    ids.add(id);
    return id;
  };
  const flushList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !r.every((c) => /^-+$/.test(c.trim())));
    out.push("<table>");
    rows.forEach((cells, i) => {
      const tag = i === 0 ? "th" : "td";
      out.push("<tr>" + cells.map((c) => `<${tag}>${inline(c.trim())}</${tag}>`).join("") + "</tr>");
    });
    out.push("</table>");
    table = [];
  };
  const heading = (level: number, text: string) => {
    flushList();
    const id = uniqueId(text);
    headings.push({ level, text, id });
    out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\|.*\|$/.test(line.trim())) { table.push(line.trim().replace(/^\||\|$/g, "").split("|")); continue; }
    flushTable();
    if (/^###\s+/.test(line)) heading(3, line.replace(/^###\s+/, ""));
    else if (/^##\s+/.test(line)) heading(2, line.replace(/^##\s+/, ""));
    else if (/^#\s+/.test(line)) heading(1, line.replace(/^#\s+/, ""));
    else if (/^[-*]\s+/.test(line)) { if (!inList) { out.push("<ul>"); inList = true; } out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`); }
    else if (line.trim() === "") flushList();
    else { flushList(); out.push(`<p>${inline(line)}</p>`); }
  }
  flushList(); flushTable();
  return { body: out.join("\n"), headings };
}

function renderDoc(title: string, markdown: string): string {
  const { body, headings } = render(markdown);
  const toc = headings.filter((h) => h.level <= 2);
  const tocHtml = toc.length > 1
    ? `<h2 class="toc-title">Table of contents</h2><ol class="toc">` +
      toc.map((h) => `<li class="toc-l${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`).join("") +
      `</ol><hr/>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{font-family:Calibri,Arial,Helvetica,sans-serif;color:#111;line-height:1.4;padding:36px;max-width:760px;font-size:11pt;}
  .doc-title{font-size:14pt;font-weight:700;margin:0 0 14px;}
  h1{font-size:14pt;font-weight:700;margin:18px 0 8px;}
  h2{font-size:13pt;font-weight:700;margin:16px 0 6px;}
  h3{font-size:13pt;font-weight:700;margin:12px 0 6px;}
  p,li,td,th{font-size:11pt;}
  .toc-title{font-size:13pt;margin:8px 0 4px;}
  ol.toc{margin:0 0 8px;padding-left:18px;} ol.toc a{color:#1a4f8a;text-decoration:none;}
  li.toc-l2{margin-left:14px;list-style:circle;}
  table{border-collapse:collapse;width:100%;margin:8px 0;} th,td{border:1px solid #bbb;padding:6px 9px;text-align:left;vertical-align:top;} th{background:#f1efe8;}
  ul{margin:6px 0 10px;padding-left:20px;} li{margin:2px 0;} hr{border:none;border-top:1px solid #ccc;margin:12px 0;}
</style></head><body><p class="doc-title">${esc(title)}</p>${tocHtml}${body}</body></html>`;
}

export function exportWord(title: string, markdown: string): void {
  const blob = new Blob(["﻿", renderDoc(title, markdown)], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFile(title)}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportPdf(title: string, markdown: string): void {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(renderDoc(title, markdown));
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}
