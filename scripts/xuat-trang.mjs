/**
 * Xuất một trang của app ra HTML tĩnh (gộp CSS) để xem offline / gửi duyệt.
 *   node scripts/xuat-trang.mjs <url> <file-đích>
 */
import { writeFileSync } from "node:fs";

const [url, dest] = process.argv.slice(2);
const html = await (await fetch(url)).text();
const base = new URL(url).origin;

const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
let css = "";
for (const href of links) {
  css += await (await fetch(href.startsWith("http") ? href : base + href)).text() + "\n";
}

// Giữ nguyên body, bỏ script của Next (bản tĩnh không cần hydrate).
const body = html.slice(html.indexOf("<body"), html.lastIndexOf("</body>") + 7)
  .replace(/<script[\s\S]*?<\/script>/g, "");

writeFileSync(dest, `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>An Sao — bản xem trước</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<style>${css}</style></head>
${body}</html>`);
console.log(`Đã ghi ${dest}`);
