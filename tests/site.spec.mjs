// Headless checks for index.html. Run: PW=<path to playwright> node tests/site.spec.mjs [baseURL]
// With no baseURL it serves the repo root on 127.0.0.1. Google Form posts are intercepted, never sent.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || undefined;

let server, base = process.argv[2];
if (!base) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise(r => server.on('listening', r));
  base = `http://127.0.0.1:${server.address().port}/`;
}

const browser = await chromium.launch({ executablePath: CHROME });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

async function open(width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  const posts = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/docs.google.com/forms/**', route => { posts.push(route.request()); route.fulfill({ status: 200, body: 'ok' }); });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  return { ctx, page, errors, posts };
}

// 1. no errors at 1440 and 390 (errors inside the cross-origin CRM iframe are not ours and don't reach here)
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const { ctx, page, errors } = await open(w, h);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.mouse.wheel(0, 700); await page.waitForTimeout(60); }
  await page.waitForTimeout(500);
  check(`no JS errors at ${w}`, errors.length === 0, errors.join(' | '));
  // 7. no sideways scroll
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`no horizontal overflow at ${w}`, over <= 0, `overflow ${over}px`);
  await ctx.close();
}
{
  const { ctx, page } = await open(320, 640);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no horizontal overflow at 320', over <= 0, `overflow ${over}px`);
  await ctx.close();
}

// 2. lead form
{
  const { ctx, page, posts } = await open(1440, 900);
  await page.locator('#contactForm button[type=submit]').click();
  await page.waitForTimeout(400);
  check('empty form is blocked', posts.length === 0 && await page.locator('#contactForm').isVisible());
  await page.fill('#f-name', 'Test Person');
  await page.fill('#f-biz', 'Test Co');
  await page.fill('#f-email', 'test@example.com');
  await page.fill('#f-msg', 'Headless form test — intercepted, not sent.');
  await page.locator('#contactForm button[type=submit]').click();
  await page.waitForTimeout(1200);
  const body = posts[0] ? posts[0].postData() || '' : '';
  const fields = ['entry.1932371136', 'entry.1167623666', 'entry.1359411807', 'entry.460682089', 'entry.616416220'];
  check('form posts once to the Google Form', posts.length === 1 && posts[0].url().endsWith('/formResponse'), `${posts.length} post(s)`);
  check('form post carries all five fields', fields.every(f => body.includes(f)), body.slice(0, 120));
  check('success message shows', await page.locator('#formSuccess').isVisible());
  await ctx.close();
}

// 3. CRM proof section
{
  const { ctx, page } = await open(1440, 900);
  const frame = page.locator('#crm iframe');
  const src = (await frame.count()) ? (await frame.getAttribute('src')) || (await frame.getAttribute('data-src')) : null;
  check('CRM iframe points at the Cedar & Main demo', !!src && src.startsWith('https://cedar-main-team-hub.lovable.app'), String(src));
  const link = page.locator('#crm a[href^="https://cedar-main-team-hub.lovable.app"]').first();
  const ok = (await link.count()) > 0 && (await link.getAttribute('target')) === '_blank' && /noopener/.test((await link.getAttribute('rel')) || '');
  check('CRM "open the full demo" link (new tab, noopener)', ok);
  await ctx.close();
}

// 4. Orbit background: present, inert, scroll-linked; still under reduced motion
const orbitAngle = page => page.evaluate(() => {
  const el = document.querySelector('.orbit [data-orbit-spin]');
  return el ? getComputedStyle(el).transform : null;
});
{
  const { ctx, page } = await open(1440, 900);
  const meta = await page.evaluate(() => {
    const o = document.querySelector('.orbit');
    if (!o) return null;
    const cs = getComputedStyle(o);
    return { hidden: o.getAttribute('aria-hidden'), pe: cs.pointerEvents, pos: cs.position };
  });
  check('orbit layer exists, aria-hidden, pointer-events:none, fixed', !!meta && meta.hidden === 'true' && meta.pe === 'none' && meta.pos === 'fixed', JSON.stringify(meta));
  const a0 = await orbitAngle(page);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 900) { await page.mouse.wheel(0, 900); await page.waitForTimeout(50); }
  await page.waitForTimeout(1500);
  const a1 = await orbitAngle(page);
  check('orbit turns with scroll', !!a0 && a0 !== a1, `${a0} -> ${a1}`);
  const hit = await page.evaluate(() => {
    const b = document.querySelector('#contactForm button[type=submit]');
    const r = b.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return at === b || b.contains(at);
  });
  check('orbit never covers content (submit button is hit-testable)', hit);
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 900, { reduce: true });
  const a0 = await orbitAngle(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  const a1 = await orbitAngle(page);
  check('reduced motion: orbit rests', !!a0 && a0 === a1, `${a0} -> ${a1}`);
  const lenis = await page.evaluate(() => document.documentElement.classList.contains('lenis'));
  check('reduced motion: no Lenis', !lenis);
  await ctx.close();
}

// 5. no violet/indigo left in the page's own design
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const hits = html.match(/#4F46E5|#7C3AED|#4338CA|#B9B4FF|#8B7FFF|#a5b4fc|rgba\(79,70,229|rgba\(124,58,237/gi) || [];
  check('no violet/indigo colours in index.html', hits.length === 0, hits.slice(0, 5).join(','));
}

// 6. every section's text visible without scrolling to it
{
  const { ctx, page } = await open(1440, 900);
  const hidden = await page.evaluate(() => Array.from(document.querySelectorAll('main section h2, main section p, main section h3'))
    .filter(e => { for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.opacity === '0' || cs.visibility === 'hidden') return true; } return false; })
    .map(e => e.textContent.trim().slice(0, 40)));
  check('no hidden section text before scroll', hidden.length === 0, hidden.slice(0, 3).join(' | '));
  await ctx.close();
}

await browser.close();
server?.close();
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
