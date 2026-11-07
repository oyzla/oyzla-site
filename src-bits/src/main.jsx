/* Oyzla site — motion layer (GSAP + ScrollTrigger + Lenis) and React Bits islands.
 *
 * Built by `npm run build` in src-bits/ into ../assets/bits/oyzla-bits.js, which is
 * committed (GitHub Pages has no build step) and loaded by index.html as a deferred
 * module, so it never blocks first paint and never touches the lead-form script.
 *
 * Ground rules (from the 2026-11-05 blank-on-mobile fix, aa6d838):
 *  - The HTML is complete and visible on its own. Nothing here hides content up front.
 *  - Entrance animations set their hidden state only at the moment they start
 *    (ScrollTrigger onEnter -> gsap.from), so a never-firing trigger leaves content visible.
 *  - prefers-reduced-motion: no Lenis, no entrance animations, no Threads, no magnet.
 *  - Every island is mounted inside its own try/catch; one failing never affects the others.
 */
import { useLayoutEffect, useRef, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Threads from './bits/Threads.jsx';
import SplitText from './bits/SplitText.jsx';
import SpotlightCard from './bits/SpotlightCard.jsx';
import Magnet from './bits/Magnet.jsx';
import CountUp from './bits/CountUp.jsx';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const mq = q => window.matchMedia?.(q).matches ?? false;
const reduce = mq('(prefers-reduced-motion: reduce)');
const finePointer = mq('(hover: hover) and (pointer: fine)');

const safe = (name, fn) => {
  try {
    fn();
  } catch (err) {
    // Never throw out of the motion layer; the static page is already complete.
    console.warn(`[oyzla-bits] ${name} skipped:`, err && err.message);
  }
};

/* ---------- helpers: let React Bits components wrap existing, server-rendered DOM ---------- */

// Moves already-rendered DOM nodes into a React-owned wrapper without recreating them,
// so hrefs, ids and listeners on the original nodes are untouched.
function Adopt({ nodes }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const host = ref.current;
    nodes.forEach(n => host.appendChild(n));
  }, [nodes]);
  return createElement('div', { ref, className: 'bits-adopt' });
}

// Converts simple inline markup (text, <br>, <span class>) to React nodes.
function toReact(node, key) {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const tag = node.tagName.toLowerCase();
  if (tag === 'br') return createElement('br', { key });
  const props = { key };
  if (node.className) props.className = node.className;
  return createElement(tag, props, ...Array.from(node.childNodes, (c, i) => toReact(c, i)));
}

// Replaces `el` with a React root rendering `element`, synchronously (no empty frame).
function mountInPlace(el, element) {
  const host = document.createElement('span');
  host.className = 'bits-host';
  el.parentNode.insertBefore(host, el);
  el.remove();
  const r = createRoot(host);
  flushSync(() => r.render(element));
  return host;
}

/* ---------- 1. Threads (React Bits background) behind the hero ---------- */
safe('threads', () => {
  if (reduce) return;
  const slot = document.querySelector('[data-bit="threads"]');
  if (!slot) return;
  const narrow = window.innerWidth < 720;
  createRoot(slot).render(
    createElement(Threads, {
      color: '#4F46E5',
      accentColor: '#7C3AED',
      amplitude: narrow ? 1.2 : 1.5,
      distance: 0.25,
      lineCount: narrow ? 46 : 72,
      thickness: 0.7,
      softness: 1.1,
      speed: 0.35,
      angle: -12,
      taper: 0.9,
      brightness: 1.1,
      fade: 0.35,
      opacity: 0.85,
      enableMouseInteraction: finePointer
    })
  );
  slot.classList.add('is-live');
});

/* ---------- 2. SpotlightCard on the service + promise cards ---------- */
safe('spotlight', () => {
  document.querySelectorAll('.svc-grid, .commit-grid').forEach(grid => {
    const cards = Array.from(grid.children);
    const r = createRoot(grid);
    const items = cards.map((card, i) => {
      const nodes = Array.from(card.childNodes);
      nodes.forEach(n => n.remove());
      const dark = card.classList.contains('svc-dark');
      return createElement(
        SpotlightCard,
        {
          key: i,
          className: card.className,
          theme: dark ? 'dark' : 'light',
          spotlightColor: dark ? '#B9B4FF' : '#4F46E5',
          intensity: dark ? 0.22 : 0.42,
          spotlightSize: 260,
          borderGlow: 0.9,
          proximity: 60,
          flare: false,
          style: { '--spotlight-card-border': 'transparent' }
        },
        createElement(Adopt, { nodes })
      );
    });
    flushSync(() => r.render(items));
  });
});

/* ---------- 3. Magnet on the primary "book a call" CTAs (mouse only) ---------- */
safe('magnet', () => {
  if (reduce || !finePointer) return;
  document.querySelectorAll('[data-bit="magnet"]').forEach(btn => {
    const placeholder = document.createElement('span');
    btn.replaceWith(placeholder);
    mountInPlace(
      placeholder,
      createElement(
        Magnet,
        { padding: 70, magnetStrength: 4, maxOffset: 12, wrapperClassName: 'bits-magnet' },
        createElement(Adopt, { nodes: [btn] })
      )
    );
  });
});

/* ---------- 4. CountUp on the real price-band figures (only once in view) ---------- */
function mountCounts() {
  if (reduce) return;
  document.querySelectorAll('[data-bit="countup"]').forEach(el => {
    const to = Number(el.dataset.to);
    if (!Number.isFinite(to)) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () =>
        safe('countup', () => {
          // The static text (e.g. "5,000") stays until this moment.
          mountInPlace(
            el,
            createElement(CountUp, {
              to,
              from: 0,
              separator: ',',
              duration: 1.6,
              mode: 'count',
              easing: 'expo',
              trigger: 'load',
              className: 'bits-count'
            })
          );
        })
    });
  });
}

/* ---------- 5. SplitText headline + GSAP entrances ---------- */
function heroIntro(splitOk) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  const bits = ['.hero .eyebrow', '.hero-sub', '.hero-ctas', '.hero-note'].map(s => hero.querySelector(s)).filter(Boolean);
  tl.from(bits[0], { y: 14, opacity: 0, duration: 0.7, clearProps: 'transform,opacity' }, 0);
  tl.from(bits.slice(1), { y: 22, opacity: 0, duration: 0.9, stagger: 0.09, clearProps: 'transform,opacity' }, splitOk ? 0.45 : 0.1);
  const cards = hero.querySelectorAll('.float-card');
  if (cards.length) {
    tl.from(cards, { opacity: 0, duration: 1, stagger: 0.14, ease: 'power2.out', clearProps: 'opacity' }, 0.35);
  }
}

function headline() {
  const h1 = document.querySelector('.hero h1');
  if (!h1) return Promise.resolve(false);
  // Only split once the real fonts are in, otherwise words re-wrap mid-animation.
  // If fonts are slow (>700ms), skip the hero intro entirely: the static hero has
  // already been on screen, and hiding it late would look like a glitch.
  const loaded = () => !document.fonts || document.fonts.status === 'loaded';
  const ready = loaded()
    ? Promise.resolve(true)
    : Promise.race([document.fonts.ready.then(loaded), new Promise(res => setTimeout(() => res(false), 700))]);
  return ready.then(ok => {
    if (!ok) return null;
    let mounted = false;
    safe('splittext', () => {
      const children = Array.from(h1.childNodes, (c, i) => toReact(c, i));
      mountInPlace(
        h1,
        createElement(
          SplitText,
          {
            tag: 'h1',
            textKey: h1.textContent,
            className: h1.className,
            splitType: 'words',
            mask: true,
            delay: 70,
            duration: 1.05,
            textAlign: 'left',
            trigger: 'load'
          },
          ...children
        )
      );
      mounted = true;
    });
    return mounted;
  });
}

function entrances() {
  // Section headers.
  document.querySelectorAll('main section:not(.hero)').forEach(sec => {
    const head = Array.from(sec.querySelectorAll(':scope > .wrap > .eyebrow, :scope > .wrap > .section-title, :scope > .wrap > .section-sub, .demo-grid > div > .section-title, .demo-grid > div > .section-sub'));
    if (!head.length) return;
    ScrollTrigger.create({
      trigger: head[0],
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.from(head, { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity' })
    });
  });

  // Cards and blocks, staggered in batches as they arrive.
  ScrollTrigger.batch(
    '.step, .svc, .commit, .who-card, .faq-item, .pilot-box, .price-band, .vs-employee, .quote-card, .form-card, .honesty, .demo-points li, .demo-note, .svc-cta, .who-note',
    {
      start: 'top 94%',
      once: true,
      onEnter: batch =>
        gsap.from(batch, { y: 30, opacity: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity' })
    }
  );

  // The scripted chat slides in with a little weight.
  const chat = document.getElementById('chat');
  if (chat) {
    ScrollTrigger.create({
      trigger: chat,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.from(chat, { y: 48, rotate: 1.5, opacity: 0, duration: 1.1, ease: 'expo.out', clearProps: 'transform,opacity' })
    });
  }

  // Step numbers pop as their card lands.
  document.querySelectorAll('.step-num').forEach(n => {
    ScrollTrigger.create({
      trigger: n,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.from(n, { scale: 0.4, duration: 0.8, delay: 0.15, ease: 'back.out(2.2)', clearProps: 'transform' })
    });
  });

  // Gentle parallax on the hero card stack (desktop layout only).
  ScrollTrigger.matchMedia({
    '(min-width: 961px)': () => {
      gsap.to('.hero-visual', {
        y: -70,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  });
}

/* ---------- 6. Lenis smooth scroll, driven by gsap.ticker ---------- */
let lenis = null;
safe('lenis', () => {
  if (reduce) return;
  lenis = new Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 1, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
});

// In-page links: smooth-scroll with Lenis, keep the URL hash and keyboard focus honest.
safe('anchors', () => {
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    // Close the phone menu after choosing a section.
    const menu = document.querySelector('.nav-links.open');
    if (menu && menu.contains(a)) {
      menu.classList.remove('open');
      document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    }
    if (!lenis) return; // native scrolling (reduced motion): let the browser do it

    e.preventDefault();
    const keyboard = e.detail === 0 || a.classList.contains('skip-link');
    // Resolve the destination from the live scroll position (not Lenis's cached one, which can
    // lag a frame behind a native scroll) and honour html{scroll-padding-top}.
    const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const y = id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY - pad;
    lenis.scrollTo(Math.max(0, y), { duration: 1.15 });
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    if (keyboard) {
      if (!target.hasAttribute('tabindex') && !target.matches('a,button,input,textarea,select,summary')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    }
  });
});

/* ---------- 7. Small polish ---------- */
safe('nav', () => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const set = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  set();
  window.addEventListener('scroll', set, { passive: true });
});

// FAQ answers change the page height: re-measure triggers below them.
document.querySelectorAll('details').forEach(d =>
  d.addEventListener('toggle', () => {
    lenis?.resize();
    ScrollTrigger.refresh();
  })
);

/* ---------- boot ---------- */
root.classList.add('bits-ready');
if (!reduce) {
  safe('countup', mountCounts);
  safe('entrances', entrances);
  headline().then(ok => ok !== null && safe('hero', () => heroIntro(ok)));
}
window.addEventListener('load', () => ScrollTrigger.refresh());
