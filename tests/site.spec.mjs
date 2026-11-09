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

// 1. no errors at 1440 and 390
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

// 3. CRM proof section: the GENERIC demo, same origin, no specific business, no Lovable
{
  const { ctx, page } = await open(1440, 900);
  const frame = page.locator('#crm iframe');
  const src = (await frame.count()) ? (await frame.getAttribute('src')) || (await frame.getAttribute('data-src')) : null;
  check('CRM iframe points at the generic demo (demo/crm/)', !!src && /^\/?demo\/crm\/$/.test(src), String(src));
  const link = page.locator('#crm a[href$="demo/crm/"]').first();
  const ok = (await link.count()) > 0 && (await link.getAttribute('target')) === '_blank' && /noopener/.test((await link.getAttribute('rel')) || '');
  check('CRM "open the full demo" link (new tab, noopener)', ok);
  // Click = consent: the card flies into a full-screen dialog running the demo; Escape flies it back.
  await page.locator('[data-crm-open]').first().click();
  await page.waitForTimeout(1400);
  const open1 = await page.evaluate(() => { const d = document.getElementById('crmDialog'); if (!d || !d.open) return null; const f = d.querySelector('iframe'); const r = d.getBoundingClientRect(); return { src: f && f.getAttribute('src'), w: r.width, h: r.height }; });
  check('clicking the CRM card opens the full-screen demo', !!open1 && /demo\/crm\/$/.test(open1.src || '') && open1.w >= 1200 && open1.h >= 700, JSON.stringify(open1));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  check('Escape closes the demo dialog', await page.evaluate(() => !document.getElementById('crmDialog').open));
  await ctx.close();
}
{
  const banned = /lovable|cedar|\bRob\b/i;
  const files = ['index.html', 'demo/crm/index.html'];
  const hits = files.filter(f => fs.existsSync(path.join(ROOT, f)) && banned.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  check('no Lovable / Cedar & Main / Rob anywhere in the site', fs.existsSync(path.join(ROOT, 'demo/crm/index.html')) && hits.length === 0, hits.join(','));
  const bundle = fs.readdirSync(path.join(ROOT, 'assets/bits')).filter(f => /lovable|cedar/i.test(fs.readFileSync(path.join(ROOT, 'assets/bits', f), 'utf8')));
  check('no Lovable / Cedar in built bundles', bundle.length === 0, bundle.join(','));
}
// 3b. The demo page itself: loads clean, labelled as a demo, has the CRM screens, and works
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (!r.url().startsWith(base)) requests.push(r.url()); });
  await page.goto(base + 'demo/crm/', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const text = await page.evaluate(() => document.body.innerText);
  check(`demo page: no JS errors at ${w}`, errors.length === 0, errors.join(' | '));
  check(`demo page: labelled as a demo with fictional data at ${w}`, /demo/i.test(text) && /fictional/i.test(text));
  const tabs = ['Today', 'Team', 'Pipeline', 'Tasks', 'Text desk', 'Documents'];
  const missing = [];
  for (const t of tabs) if (!(await page.getByRole('tab', { name: t }).count())) missing.push(t);
  check(`demo page: has all six screens at ${w}`, missing.length === 0, missing.join(','));
  // a tab switch actually changes the screen
  await page.getByRole('tab', { name: 'Pipeline' }).click();
  await page.waitForTimeout(300);
  check(`demo page: Pipeline screen shows at ${w}`, await page.locator('#screen-pipeline').isVisible());
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`demo page: no horizontal overflow at ${w}`, over <= 0, `overflow ${over}px`);
  check(`demo page: makes no third-party requests at ${w}`, requests.filter(u => !/fonts\.(googleapis|gstatic)\.com/.test(u)).length === 0, requests.join(','));
  await ctx.close();
}

// 4. 3D scroll background: present, inert, behind everything, scroll-linked; still under reduced motion
const sceneZ = page => page.evaluate(() => window.__oyzlaScene ? window.__oyzlaScene.cameraZ : null);
{
  const { ctx, page } = await open(1440, 900);
  await page.waitForTimeout(1500);
  const meta = await page.evaluate(() => {
    const c = document.querySelector('canvas.scene-bg');
    if (!c) return null;
    const cs = getComputedStyle(c);
    return { hidden: c.getAttribute('aria-hidden'), pe: cs.pointerEvents, pos: cs.position, z: cs.zIndex, gl: !!window.__oyzlaScene };
  });
  check('3D background canvas exists, aria-hidden, pointer-events:none, fixed, z 0', !!meta && meta.hidden === 'true' && meta.pe === 'none' && meta.pos === 'fixed' && meta.z === '0' && meta.gl, JSON.stringify(meta));
  const z0 = await sceneZ(page);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H / 2; y += 900) { await page.mouse.wheel(0, 900); await page.waitForTimeout(50); }
  await page.waitForTimeout(1500);
  const z1 = await sceneZ(page);
  check('3D camera flies with scroll', z0 != null && z1 != null && z1 < z0 - 5, `${z0} -> ${z1}`);
  const hit = await page.evaluate(() => {
    const b = document.querySelector('#contactForm button[type=submit]');
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return at === b || b.contains(at);
  });
  check('background never covers content (submit button is hit-testable)', hit);
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 900, { reduce: true });
  await page.waitForTimeout(800);
  const z0 = await sceneZ(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  const z1 = await sceneZ(page);
  const st = await page.evaluate(() => window.__oyzlaScene ? window.__oyzlaScene.static : null);
  check('reduced motion: 3D scene rests (one still frame)', st === true && z0 === z1, `static=${st} ${z0} -> ${z1}`);
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
