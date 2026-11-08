// 產生 AR 實體卡片圖（可列印）並以 MindAR 編譯成影像追蹤目標檔 web/ar/targets.mind
// 需求：Playwright + Chromium。用法：node project030/tools/make-ar-targets.mjs
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'web');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.mind': 'application/octet-stream' };

const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
await page.goto(base + '/vendor/mindar/ui-fBadYuor.js').catch(() => {});
await page.setContent('<html><body></body></html>');

const cards = await page.evaluate(async () => {
  // 決定性亂數：每張卡片都可重新產生
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const draw = (label, seed, glyph) => {
    const W = 600, H = 840, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = '#f3efe6'; g.fillRect(0, 0, W, H);
    // 高對比、不對稱紋理：影像追蹤需要大量特徵點
    for (let i = 0; i < 260; i++) {
      g.save();
      g.translate(r() * W, r() * H); g.rotate(r() * Math.PI * 2);
      g.fillStyle = `hsl(${Math.floor(r() * 360)},${30 + r() * 50}%,${10 + r() * 45}%)`;
      g.globalAlpha = 0.55 + r() * 0.45;
      const s = 6 + r() * 46, k = Math.floor(r() * 4);
      g.beginPath();
      if (k === 0) g.rect(-s / 2, -s / 4, s, s / 2);
      else if (k === 1) { g.moveTo(0, -s / 2); g.lineTo(s / 2, s / 2); g.lineTo(-s / 2, s / 2); g.closePath(); }
      else if (k === 2) g.arc(0, 0, s / 3, 0, Math.PI * (1 + r()));
      else { g.moveTo(-s, 0); g.lineTo(s, 0); g.lineWidth = 2 + r() * 4; g.strokeStyle = g.fillStyle; g.stroke(); }
      if (k !== 3) g.fill();
      g.restore();
    }
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(243,239,230,0.88)'; g.fillRect(60, 250, W - 120, 340);
    g.strokeStyle = '#111'; g.lineWidth = 6; g.strokeRect(60, 250, W - 120, 340);
    g.save(); g.translate(W / 2, 420); g.scale(5, 5); g.translate(-24, -24);
    g.strokeStyle = '#111'; g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round';
    g.stroke(new Path2D(glyph)); g.restore();
    g.fillStyle = '#111'; g.font = 'bold 34px monospace'; g.textAlign = 'center';
    g.fillText('PROJECT 030', W / 2, 560);
    g.font = 'bold 64px monospace'; g.fillText(label, W / 2, 120);
    g.font = '22px monospace'; g.fillText('PROJECTION CARD', W / 2, 160);
    g.fillRect(0, 0, W, 16); g.fillRect(0, H - 16, W, 16);
    return c.toDataURL('image/png');
  };
  return {
    A: draw('CARD A', 30, 'M24 6 L42 24 L24 42 L6 24Z M24 24 L24 42'),
    B: draw('CARD B', 3030, 'M12 42 V20 A12 12 0 0 1 36 20 V42 M24 30 L24 42'),
  };
});

mkdirSync(join(root, 'ar'), { recursive: true });
for (const [k, v] of Object.entries(cards)) {
  writeFileSync(join(root, 'ar', `card-${k}.png`), Buffer.from(v.split(',')[1], 'base64'));
}
console.log('cards written');

await page.goto(base + '/ar/card-A.png');
const mind = await page.evaluate(async (urls) => {
  const { Compiler } = await import('/vendor/mindar/mindar-image.prod.js');
  const imgs = await Promise.all(urls.map((u) => new Promise((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u;
  })));
  const compiler = new Compiler();
  await compiler.compileImageTargets(imgs, (p) => { if (Math.round(p) % 20 === 0) console.log('compile', Math.round(p)); });
  const buf = await compiler.exportData();
  return Array.from(new Uint8Array(buf));
}, ['/ar/card-A.png', '/ar/card-B.png']);
writeFileSync(join(root, 'ar', 'targets.mind'), Buffer.from(mind));
console.log('targets.mind', mind.length, 'bytes');
await browser.close();
server.close();
