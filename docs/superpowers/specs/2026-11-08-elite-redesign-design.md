# oyzlaleads.com — elite redesign, CRM proof, scroll background (design)

Date: 2026-11-08 · Owner: Matai · Built by: Claude (non-interactive session; decisions below
were made against Matai's written brief and are flagged where he may want a say)

## Goal

Bring the live static site up to the standard of the approved Lovable test build
(approve-before-send-ai.lovable.app) **in this repo's own code**, add a Custom CRM proof
section, and add Matai's scroll-driven background animation. Lead form must keep working.

## What makes the demo look elite (and the live site lacks)

| Demo | Live (before) |
|---|---|
| Warm ivory ground, navy ink, one saffron accent | Indigo/violet SaaS gradient, purple glows (reads "AI template") |
| Hero visual is the product: an approval queue with Approve/Hold | Three floating, bobbing cards over a WebGL threads mood |
| One card style, one button pair, calm restraint, alternating grounds | Many card/box styles (dashed box, gradient pilot box, dark callout, tinted price band) |
| FAQ wording matches the managed-service model | FAQ said "you keep everything we built" — contradicts the refund policy and the 2026-09-07 positioning decision |

## Decisions

- **Palette** (Oyzla's own, from the approved demo, via taste-skill `start.mjs brand`):
  bg `#FAF7F0`, surface `#F2ECE0`, ink/navy `#14213D`, muted `#5B6275`, accent saffron
  `#E8862A` (dark text on saffron; accent *text* uses `#A85A12` for contrast). No violet anywhere.
- **Type** (dealt by taste-skill for software): Host Grotesk 400–700 (display 500, −3.5% tracking)
  + JetBrains Mono for small labels/figures. Replaces Inter + Sora.
- **Kind**: software (AI product + dashboard). Hero = live HTML approval queue in an app frame;
  Approve/Hold are clickable and animate the row (fictional items, labelled as a demo).
- **Copy**: keep the live site's real facts verbatim where they exist (pilot $1,500 + $300/mo,
  ~$5,000 setup + ~$2,000/mo estimates, per-service "from" estimates, comparison figures,
  Samson's quote, contact form). Adopt the demo's wording for hero lead and FAQ ownership/cancel
  answers (managed service). Invent nothing.
- **CRM proof section** (`#crm`): "We build custom CRMs too." An app-framed, lazy-loaded
  `<iframe>` of https://cedar-main-team-hub.lovable.app (no frame-blocking headers, checked),
  plus an "Open the full demo" link (new tab). Honesty line: built as a demo for a commercial
  real-estate brokerage; Cedar & Main is a stand-in name and every record is demo data.
  Rob / his firm are **not named** on the public page (no permission on file) — flag to Matai.
  On touch screens the frame starts behind a "Tap to explore" cover so it never traps page
  scrolling; on desktop it is live immediately.
- **Scroll background ("Orbit")**: one fixed, `aria-hidden`, `pointer-events:none` layer at
  `z-index:0` behind all content (content wraps at `z-index:1`). It draws Oyzla's logo mark at
  architectural scale: a large open ring (the mark's arc + its dot) and a fine counter-ring with
  tick marks. Scroll progress (GSAP ScrollTrigger `scrub`, Lenis-smoothed) rotates the rings,
  carries the saffron dot round the arc, and closes the arc's gap as the page reaches the
  contact form ("the loop closes when you approve"). Over the navy bands the strokes swap to
  ivory at low opacity. Strokes are ≤ 9% opacity; only `transform` and `opacity` animate
  (compositor-only); the SVG is drawn once. `prefers-reduced-motion`: no Lenis, no scrub —
  the rings rest in their start pose. If the module fails, the static ring still shows.
- **Motion**: hero enters once on load (SplitText headline, queue rows stagger in). Hover:
  cards lift 2px, buttons step and press. **Removed**: per-card scroll fade-ins and hero
  parallax (they hid content and fight the "content always readable" rule), Threads WebGL.
  React Bits kept: SplitText, Magnet, CountUp, SpotlightCard (re-coloured saffron).

## Taste-skill deviations (Matai's brief wins)

- Lenis smooth scroll and a scroll-linked background: taste-skill bans both; Matai's standing
  rule and this brief require them. Waived with this reason.
- The site is not rebuilt on the taste-skill starter/kit; the existing static page is restyled
  in place (one self-contained `index.html` + the committed bits bundle), as the README requires.

## Sections

hero · how · services · pricing · demo (scripted chat) · crm (new) · promise + reference ·
who + faq · contact · footer.

## Verification

Headless Chromium only (never Matai's browser): screenshots at 1440, 1024, 768, 390; console
errors = 0; form submit test against a request interceptor (no real lead sent); reduced-motion
run; taste-skill copy-lint + consistency; code review agent. After deploy: curl + headless
screenshot of https://oyzlaleads.com, then open it once in a new Safari tab.
