/**
 * Xuất lá số ra file HTML tĩnh để đối chiếu mắt thường với mockup chuẩn.
 * Dùng SSR của chính app nên markup/CSS y hệt lúc chạy thật.
 *
 *   node scripts/xuat-la-so.mjs <url> <file-đích>
 */
import { writeFileSync } from "node:fs";

const [url, dest] = process.argv.slice(2);
const html = await (await fetch(url)).text();

// Gộp CSS của Next (link rel=stylesheet) vào file để mở offline được.
const base = new URL(url).origin;
const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
let css = "";
for (const href of links) {
  css += await (await fetch(href.startsWith("http") ? href : base + href)).text();
}

const body = html.slice(html.indexOf('<div class="la-so-root'));
const laSo = body.slice(0, body.indexOf("<script"));

writeFileSync(dest, `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<title>Lá số — đối chiếu mockup</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@700;800&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Montserrat:wght@700;900&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}
body{background:#0d0d0f;display:flex;justify-content:center;padding:20px}
${css}</style></head><body>${laSo}</body></html>`);
console.log(`Đã ghi ${dest}`);
