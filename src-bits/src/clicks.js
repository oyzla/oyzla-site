/* Click = consent (Matai, 2026-11-09). Full animations play ONLY after a visitor clicks:
 *
 *  1. The CRM demo screen flies out of its tilted frame into a full-screen view of the live
 *     demo (FLIP), while the 3D background warps. Esc, the close button or the backdrop flies
 *     it back, faster than it came.
 *  2. A service card's "Ask about this" expands the card into a centred sheet (FLIP).
 *  3. Approving a draft in the hero sends a streak off the row and a burst through the 3D scene.
 *
 * Scrolling never triggers any of this. Under reduced motion every flight becomes an instant
 * open/close. Interrupting a flight (Esc mid-open) reverses from where it is, never jumps.
 */
import { gsap } from 'gsap';

const scene = () => window.__oyzlaScene || null;

// The transform that puts an element laid out at rect `to` visually onto rect `from`.
function flipFrom(from, to) {
  return {
    x: from.left - to.left,
    y: from.top - to.top,
    scaleX: from.width / to.width,
    scaleY: from.height / to.height
  };
}

export function mountClicks({ lenis, reduce }) {
  /* ---------- 1. CRM demo: fly into full screen ---------- */
  const dlg = document.getElementById('crmDialog');
  const opener = document.querySelector('[data-crm-open]');
  const card = document.querySelector('.crm-card .browser');
  if (dlg && opener && card && typeof dlg.showModal === 'function') {
    const full = dlg.querySelector('.crm-full');
    const frame = full.querySelector('iframe');
    const closeBtn = dlg.querySelector('[data-crm-close]');
    let tl = null;
    let closing = false;

    const open = e => {
      e.preventDefault();
      if (dlg.open) return;
      closing = false; // a close flight cut short by a native close must not leave us stuck
      if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
      lenis?.stop();
      dlg.showModal();
      closeBtn.focus({ preventScroll: true });
      if (reduce) return;
      tl?.kill();
      const from = card.getBoundingClientRect();
      const to = full.getBoundingClientRect();
      scene()?.warp(true);
      tl = gsap.timeline({ onComplete: () => scene()?.warp(false) });
      tl.fromTo(full,
        { ...flipFrom(from, to), rotationX: 16, transformPerspective: 1800, transformOrigin: '0 0' },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, rotationX: 0, duration: 0.85, ease: 'power4.inOut' }, 0)
        .fromTo(dlg, { backgroundColor: 'rgba(4,4,4,0)' }, { backgroundColor: 'rgba(4,4,4,0.86)', duration: 0.4, ease: 'power1.out' }, 0)
        .to(card, { opacity: 0, duration: 0.2 }, 0)
        .fromTo(closeBtn, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.65);
    };

    const close = () => {
      if (!dlg.open || closing) return;
      const done = () => {
        closing = false;
        dlg.close();
        gsap.set([full, closeBtn, card, dlg], { clearProps: 'all' });
        lenis?.start();
        opener.focus({ preventScroll: true });
      };
      tl?.kill();
      if (reduce) return done();
      closing = true;
      scene()?.warp(false);
      // Where the frame is laid out (its current transform removed), and where the card is now.
      const now = full.getBoundingClientRect();
      const tx = gsap.getProperty(full, 'x');
      const ty = gsap.getProperty(full, 'y');
      const layout = { left: now.left - tx, top: now.top - ty, width: full.offsetWidth, height: full.offsetHeight };
      tl = gsap.timeline({ onComplete: done });
      tl.to(closeBtn, { opacity: 0, duration: 0.12 }, 0)
        .to(full, { ...flipFrom(card.getBoundingClientRect(), layout), rotationX: 16, duration: 0.5, ease: 'power3.inOut' }, 0)
        .to(dlg, { backgroundColor: 'rgba(4,4,4,0)', duration: 0.5, ease: 'power1.in' }, 0)
        .to(card, { opacity: 1, duration: 0.18 }, 0.36);
    };

    opener.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  }

  /* ---------- 2. Service card → sheet ---------- */
  const sheet = document.getElementById('svcSheet');
  if (sheet && typeof sheet.showModal === 'function') {
    const title = sheet.querySelector('#svcSheetTitle');
    const from = sheet.querySelector('[data-sheet-from]');
    const body = sheet.querySelector('[data-sheet-body]');
    const ask = sheet.querySelector('[data-sheet-ask]');
    let source = null;
    let current = '';
    let tween = null;

    document.querySelectorAll('[data-svc-open]').forEach(btn => { btn.hidden = false; });

    document.addEventListener('click', e => {
      const btn = e.target.closest && e.target.closest('[data-svc-open]');
      if (!btn) return;
      const svc = btn.closest('.svc');
      if (!svc || sheet.open) return;
      source = btn;
      current = svc.querySelector('h3')?.textContent.trim() || '';
      title.textContent = current;
      from.textContent = svc.querySelector('.svc-from')?.textContent.trim() || '';
      body.textContent = svc.querySelector('p')?.textContent.trim() || '';
      lenis?.stop();
      sheet.showModal();
      if (reduce) return;
      tween?.kill();
      const a = svc.getBoundingClientRect();
      const b = sheet.getBoundingClientRect();
      tween = gsap.fromTo(sheet,
        { ...flipFrom(a, b), transformOrigin: '0 0', opacity: 0.6 },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.55, ease: 'expo.out', clearProps: 'transform,opacity' });
      scene()?.burst();
    });

    const closeSheet = instant => {
      if (!sheet.open) return;
      const done = () => {
        sheet.close();
        gsap.set(sheet, { clearProps: 'all' });
        lenis?.start();
      };
      tween?.kill();
      if (reduce || instant) return done();
      tween = gsap.to(sheet, { scale: 0.96, opacity: 0, duration: 0.22, ease: 'power2.out', onComplete: () => { done(); source?.focus({ preventScroll: true }); } });
    };
    sheet.querySelectorAll('[data-sheet-close]').forEach(b => b.addEventListener('click', () => closeSheet(false)));
    sheet.addEventListener('cancel', e => { e.preventDefault(); closeSheet(false); });
    // Backdrop clicks land on the <dialog> itself; so do clicks in its padding, so check the box.
    sheet.addEventListener('click', e => {
      if (e.target !== sheet) return;
      const r = sheet.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) closeSheet(false);
    });
    // "Ask us about it": close, prefill the enquiry (only if it's empty); the anchor handler scrolls.
    ask.addEventListener('click', () => {
      closeSheet(true);
      const msg = document.getElementById('f-msg');
      if (msg && !msg.value.trim() && current) msg.value = `I'd like to talk about the ${current}.`;
    });
  }

  /* ---------- 3. Approve in the hero queue: streak + scene burst ---------- */
  const queue = document.getElementById('queue');
  if (queue) {
    queue.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('.q-approve');
      if (!b) return;
      scene()?.burst();
      if (reduce) return;
      const row = b.closest('.q');
      const spark = document.createElement('span');
      spark.className = 'q-spark';
      spark.setAttribute('aria-hidden', 'true');
      row.appendChild(spark);
      gsap.timeline({ onComplete: () => spark.remove() })
        .fromTo(spark, { scaleX: 0, opacity: 1, x: 0 }, { scaleX: 1, duration: 0.18, ease: 'power2.out' })
        .to(spark, { x: 160, opacity: 0, duration: 0.34, ease: 'power3.in' });
    });
  }

  /* ---------- The background dims behind reading-heavy sections (canvas opacity only) ---------- */
  const canvas = document.querySelector('canvas.scene-bg');
  const dimmed = document.querySelectorAll('[data-dim]');
  if (canvas && dimmed.length && 'IntersectionObserver' in window) {
    const on = new Set();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => (en.isIntersecting ? on.add(en.target) : on.delete(en.target)));
      canvas.classList.toggle('is-dim', on.size > 0);
    }, { rootMargin: '-45% 0px -45% 0px' });
    dimmed.forEach(el => io.observe(el));
  }
}
