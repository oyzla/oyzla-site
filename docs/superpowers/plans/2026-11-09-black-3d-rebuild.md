# Black 3D Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild oyzlaleads.com on black with a scroll-driven Three.js background, a generic fictional CRM demo, and click-triggered fly-in animations — without touching copy, prices or the lead form.

**Architecture:** index.html stays static and complete without JS. The motion layer (src-bits → assets/bits/oyzla-bits.js) gains the click animations; a second Vite build (src-bits/vite.scene.config.js → assets/bits/oyzla-scene.js) holds Three.js so the main layer never waits on it. The demo is a standalone static page at demo/crm/index.html embedded by same-origin iframe.

**Tech Stack:** Static HTML/CSS, GSAP 3 + ScrollTrigger, Lenis, React Bits islands, Three.js, Vite 8, Playwright for checks.

Spec: `docs/superpowers/specs/2026-11-09-black-3d-rebuild-design.md`

## Global Constraints
- No `lovable` and no `Cedar` string anywhere in shipped files (index.html, demo/, assets/).
- Prices, services, FAQ and form copy unchanged (only colour/markup around them).
- Form posts to the same Google Form with the same five entry ids.
- Background canvas: position fixed, z-index 0, pointer-events none, aria-hidden="true".
- prefers-reduced-motion: no Lenis, no scene loop, no click flights (instant open/close).
- Run checks: `PW=$(npm root -g)/playwright node tests/site.spec.mjs` → all PASS.

---

### Task 1: Tests first
**Files:** Modify `tests/site.spec.mjs` (section 3 CRM, section 4 orbit → scene, add dialog + no-lovable checks).
- [ ] Replace the Cedar iframe checks with: iframe src ends `demo/crm/`; `#crm a[href$="demo/crm/"]` exists; grep of index.html + demo/crm/index.html has no /lovable|cedar/i.
- [ ] Replace orbit checks with scene checks: `canvas.scene-bg` fixed/aria-hidden/pointer-events none; `window.__oyzlaScene.cameraZ` differs after scrolling; reduced motion → `__oyzlaScene.static === true` and z unchanged.
- [ ] Add: click `[data-crm-open]` → `#crmDialog[open]` visible and contains an iframe at demo/crm/; Escape closes it.
- [ ] Add: demo/crm/index.html loads with no JS errors, shows "Demo" label, has Today/Pipeline/Text desk tabs.
- [ ] Run → expect FAILs on the new checks. Commit.

### Task 2: Generic CRM demo page
**Files:** Create `demo/crm/index.html`.
- [ ] Build the six screens with fictional data (spec). No network, no storage.
- [ ] Run tests → demo checks PASS. Commit.

### Task 3: Three.js background scene
**Files:** Create `src-bits/src/scene/scene.js`, `src-bits/vite.scene.config.js`; modify `src-bits/package.json` (three, build script).
- [ ] `mountScene(canvas)` → exposes `window.__oyzlaScene = { cameraZ, static, burst(), warp(on) }`.
- [ ] Build both bundles. Run tests → scene checks PASS. Commit.

### Task 4: Black restyle + markup
**Files:** Modify `index.html` (tokens, all section styles, orbit markup → canvas, CRM section → generic demo + dialog, service cards as buttons).
- [ ] Swap tokens to the black palette, fonts to Mona Sans + Geist Mono.
- [ ] Replace Cedar iframe with demo/crm/ iframe inside a 3D-tilted frame and a `<dialog id="crmDialog">`.
- [ ] Run tests. Commit.

### Task 5: Click animations
**Files:** Create `src-bits/src/clicks.js`; modify `src-bits/src/main.jsx` (remove orbit, mount clicks).
- [ ] CRM fly-in/out (FLIP + scene warp), Approve streak (scene burst), service card expand sheet with prefill.
- [ ] Build, run tests → all PASS. Commit.

### Task 6: Verify, review, deploy
- [ ] taste-skill gate + screenshots 1440/1024/768/390; fix findings.
- [ ] Code review (ecc:code-reviewer / superpowers:requesting-code-review); fix.
- [ ] Push to main; verify live with curl + headless run of tests against https://oyzlaleads.com/.
