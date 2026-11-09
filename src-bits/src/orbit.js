/* Orbit — Matai's scroll background (2026-11-08).
 *
 * The Oyzla mark (an open ring with a dot) drawn at architectural scale behind the page.
 * As the visitor scrolls, the ring turns, the tick ring counter-turns, the saffron dot runs
 * round the arc, and a filler piece slides into the arc's gap so the loop closes by the
 * contact form ("you approve, the loop closes").
 *
 * Rules it keeps:
 *  - Background only: the layer is position:fixed, z-index 0, pointer-events:none, aria-hidden
 *    (index.html). Nothing here touches content, focus or scrolling.
 *  - Compositor only: every tween is a rotate on its own layer (will-change: transform in CSS).
 *    The SVG is never redrawn, so phones don't repaint a viewport-sized layer per frame.
 *  - One scrubbed timeline over the whole page (scrub 0.8 eases it on top of Lenis).
 *  - Reduced motion: never called (main.jsx), so the rings rest in their drawn pose.
 *  - Over navy sections the strokes switch to ivory (one class toggle, not per frame).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function mountOrbit() {
  const orbit = document.querySelector('.orbit');
  if (!orbit) return;
  const spin = orbit.querySelector('[data-orbit-spin]');
  const ticks = orbit.querySelector('[data-orbit-ticks]');
  const fill = orbit.querySelector('[data-orbit-fill]');
  const dot = orbit.querySelector('[data-orbit-dot]');
  if (!spin || !ticks || !fill || !dot) return;

  // Geometry (index.html): the main arc runs -56°..244°, so the gap is 244°..304° (centre 274°).
  // The 57° filler is drawn at 186°..243°, hidden under the main arc; +59.5° parks it at
  // 245.5°..302.5°, centred on the gap, its round caps covering the seams.
  // The dot starts on the arc's leading end (-56°) and travels 250° along it.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true
    }
  });
  tl.to(spin, { rotation: 140, duration: 1 }, 0)
    .to(ticks, { rotation: -60, duration: 1 }, 0)
    .to(dot, { rotation: 250, duration: 1 }, 0)
    // The gap only starts closing in the last third, landing as the form comes into view.
    .fromTo(fill, { rotation: 0 }, { rotation: 59.5, ease: 'power2.inOut', duration: 0.3 }, 0.66);

  // Ivory strokes while a navy band (or the footer) sits behind the middle of the screen.
  document.querySelectorAll('.band, footer').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: self => orbit.classList.toggle('on-dark', self.isActive)
    });
  });

  return tl;
}
