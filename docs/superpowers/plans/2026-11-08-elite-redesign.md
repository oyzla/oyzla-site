# Elite redesign — implementation plan

Spec: `docs/superpowers/specs/2026-11-08-elite-redesign-design.md`

**Goal:** restyle index.html to the ivory/navy/saffron system, add #crm and the Orbit
background, keep the lead form and scripted chat intact.

**Tests (written first, run headless against a local http server):** `tests/site.spec.mjs`
1. No console/page errors at 1440 and 390.
2. Lead form: empty submit is blocked; filled submit POSTs once to docs.google.com/forms
   `/formResponse` with the five mapped `entry.*` fields (intercepted, never sent) and shows
   `#formSuccess`.
3. `#crm iframe` points at cedar-main-team-hub.lovable.app and an "Open the full demo" link
   exists with target=_blank rel=noopener.
4. Orbit layer exists, is `aria-hidden`, `pointer-events:none`, and its rotation changes
   between scrollY 0 and the page bottom (motion on); with reduced motion it does not.
5. No element of the page uses violet/indigo (#4F46E5, #7C3AED) any more.
6. Every section's text is visible (opacity 1) without scrolling to it (no hidden reveals).
7. No horizontal overflow at 390 and 320.

## Tasks

1. Write `tests/site.spec.mjs`; run → fails on 3, 4, 5 (red).
2. `index.html` CSS: replace tokens + fonts; one card, one button pair; navy bands for
   demo/reference; remove float cards, aurora, Threads styles.
3. Hero markup → approval queue app frame (+ small inline script for Approve/Hold).
4. Services/pricing restructure: pilot + full setup pair, comparison line, five service cards.
5. FAQ ownership/cancel answers → managed-service wording (+ FAQ JSON-LD to match).
6. Add `#crm` section (iframe, cover for touch, link, honesty line).
7. Orbit layer: static SVG in index.html; `src-bits/src/orbit.js` scroll choreography;
   strip scroll fade-ins/parallax/Threads from `main.jsx`; recolour Spotlight; rebuild bundle.
8. Run tests (green), screenshots 1440/1024/768/390, reduced-motion run, copy-lint.
9. Code review (ecc:code-reviewer agent) → fix findings → re-run tests.
10. Commit, push to main, verify live (curl + headless screenshot + console), open once in Safari.
