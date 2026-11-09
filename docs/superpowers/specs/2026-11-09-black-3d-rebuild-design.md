# Oyzla site — black, 3D background, generic CRM demo (design)

Date: 2026-11-09. Source of truth: Matai's brief of Nov 9 00:08–00:44 (session non-interactive;
the brief is the approved design). Supersedes the ivory/navy design of 2026-11-08 for colour and
background only — copy, prices, form and legal pages are unchanged.

## Hard rules (verbatim from the brief)
- NO LOVABLE for anything. Nothing on the site loads or links a `*.lovable.app` URL.
- The demo must NOT show any specific business: no "Cedar & Main", no Rob's brokerage, no real
  business name, logo or identity. Neutral fictional branding, clearly labeled as a demo.
- Scroll animation stays in the BACKGROUND ONLY and never gates scrolling, reading or clicking.
- Click = consent: a full animation may play only after a click.
- Respect prefers-reduced-motion. Do not invent facts, prices or claims. Lead form keeps working.

## Look
- Ground #070707, text #F2EDE4, muted #A8A196, accent saffron #E8862A (Oyzla's own) with a warm
  ember glow; hairlines rgba(242,237,228,.09). Type: Mona Sans (wide axis for display) + Geist Mono
  (taste-skill `start.mjs brand --type mona`). Cards are near-opaque #0F0F0F panels so text never
  sits on moving pixels.
- Reference read: the video at /tmp/adidas-parallax-reference.mp4 is a @madebyeveren Apple-Watch
  "ULTRA" parallax site (not the CHILE 20 one named in the brief). What it does: black stage, one
  object lit from below by a red/orange pool of light, giant type behind, camera pushes in on
  scroll, accent hue shifts per chapter. We take the feel, not the object.

## 3D background (assets/bits/oyzla-scene.js, Three.js)
- One fixed full-viewport `<canvas>` under everything: z-index 0, pointer-events none,
  aria-hidden. One WebGL context.
- Scene: Oyzla's open-ring mark as a glowing 3D arc (the "doorway"), a pooled glow under it,
  a tunnel of floating draft "windows" (dark glass panels with UI lines), ember light trails and
  dust. Scroll progress (0..1 over the page) flies the camera down the tunnel (z 10 → −120),
  passing the windows in depth; accent hue shifts saffron → ember → amber → saffron; at the
  contact form the camera reaches a second ring whose gap closes ("you approve, the loop closes").
  Pointer adds a small parallax.
- Never blocking: reads window.scrollY only (works with Lenis and native scroll); never listens
  to wheel/touch to prevent default; DPR capped (1.5 desktop, 1 phone); fewer instances on
  phones; pauses when the tab is hidden; canvas dims behind dense sections.
- Fallbacks: reduced motion → one still frame, no loop. No WebGL / error → CSS radial glow.

## Click-triggered animations (GSAP)
1. CRM demo card: click "Open the live demo" → the tilted 3D browser frame flies forward
   (FLIP from its rect to the viewport) into a full-screen dialog running the demo; background
   scene does a warp burst. Esc / close button flies it back. Focus moves into the dialog.
2. Hero approval queue: clicking Approve sends a streak into the 3D scene (scene `burst()`).
3. Service cards: click → card expands (FLIP) into a detail sheet with the same copy, its price
   line, the approval-gate line and "Ask about this" (scrolls to the form and prefills the
   message). No new facts.

## Generic CRM demo (demo/crm/index.html, same origin, static)
- Fictional "Sample Realty Co." workspace, labeled DEMO on every screen; people Jordan, Priya,
  Marcus, Elena, Sam (first names only); fictional listings/deals.
- Screens: Today (list + approvals), Team board, Pipeline (kanban, click to advance), Tasks
  (checkable), Text desk (threads with AI drafts awaiting approval), Document rooms.
- Black with warm gold/saffron accents. Pure HTML/CSS/vanilla JS, no network calls.
- Embedded on the home page in an iframe (lazy) inside the CRM proof section with "Open the full
  demo ↗" to /demo/crm/.

## Testing
tests/site.spec.mjs (Playwright, headless, own Chromium):
- no JS errors at 1440/390, no overflow; form blocked when empty, posts once with 5 fields;
- no "lovable" / "Cedar" anywhere in index.html or demo/crm; CRM iframe src is demo/crm/;
- scene canvas exists, fixed, pointer-events none, aria-hidden; camera z changes with scroll;
  reduced motion: scene static, no Lenis;
- clicking the CRM card opens the dialog with the demo; Esc closes it;
- form submit button is hit-testable (nothing covers content).
