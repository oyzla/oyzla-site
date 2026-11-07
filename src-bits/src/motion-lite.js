/* Oyzla: tiny stand-in for the three `motion/react` exports React Bits CountUp uses
 * (animate, cubicBezier, useInView). The full motion package added ~35 KB gzipped to a
 * page that only needs a number to roll once. Aliased in vite.config.js. */
import { useEffect, useState } from 'react';

export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  const solve = x => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0, hi = 1;
    t = x;
    while (lo < hi && Math.abs(sx(t) - x) > 1e-6) {
      if (sx(t) < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
      if (hi - lo < 1e-7) break;
    }
    return t;
  };
  return x => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
}

// animate(from, to, { duration (s), delay (s), onUpdate, onComplete }) with linear easing,
// which is the only way CountUp calls it. Returns { stop }.
export function animate(from, to, { duration = 0.3, delay = 0, onUpdate, onComplete } = {}) {
  let raf = 0, timer = 0, start = 0, stopped = false;
  const step = now => {
    if (stopped) return;
    if (!start) start = now;
    const p = duration > 0 ? Math.min(1, (now - start) / (duration * 1000)) : 1;
    onUpdate?.(from + (to - from) * p);
    if (p < 1) raf = requestAnimationFrame(step);
    else onComplete?.();
  };
  const begin = () => { raf = requestAnimationFrame(step); };
  if (delay > 0) timer = setTimeout(begin, delay * 1000); else begin();
  return { stop: () => { stopped = true; clearTimeout(timer); cancelAnimationFrame(raf); } };
}

export function useInView(ref, { once = false, margin = '0px' } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || (once && inView)) return undefined;
    if (!('IntersectionObserver' in window)) { setInView(true); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); if (once) io.disconnect(); }
      else if (!once) setInView(false);
    }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, margin, inView]);
  return inView;
}
