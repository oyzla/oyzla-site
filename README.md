# Oyzla AI — Static Marketing Site

Static site served at **oyzlaleads.com** (legacy domain name; the business is
**Oyzla AI**). No build step, no server, no framework — every page is a single
self-contained HTML file with inline CSS and JS.

Business email: **oyzla.ai@gmail.com**

## File structure

| File | Purpose |
|---|---|
| `index.html` | Landing page: hero, how-it-works, services & pricing, scripted chat demo, commitments, client reference, contact form. |
| `privacy-policy.html` | Privacy Policy — includes a Cookies section. **Needs counsel review.** |
| `terms-of-service.html` | Terms of Service. **Needs counsel review.** |
| `refund-policy.html` | Refund & Cancellation Policy. **Needs counsel review.** |
| `onboarding.html` | ⚠ **Legacy.** Post-Stripe questionnaire for the retired "Oyzla Leads" insurance-lead product. Not linked from anywhere and `noindex`, but still publicly reachable. See `AUDIT-REPORT.md` — retire or rewrite. |
| `favicon.svg` | ⚠ Old "Oyzla Leads" mark (blue ring on navy). Only `onboarding.html` uses it; the other pages use an inline data-URI favicon of the current Oyzla AI mark. |
| `CNAME` | GitHub Pages custom domain — contains exactly `oyzlaleads.com`. |
| `AUDIT-REPORT.md` | Compliance / accessibility / credibility audit, 11 Sep 2026. Lists the owner placeholders still to fill. |

There are **no raster images in this repo**. Every logo, icon and illustration is
an inline SVG. `favicon-48.png`, `apple-touch-icon.png`, `og-image.png` and
`previews/` were referenced by the old README but do not exist; the dead `<link>`
tags for the first two were removed from `onboarding.html`.

## External requests the site makes

1. `fonts.googleapis.com` + `fonts.gstatic.com` — Inter and Sora webfonts (`index.html` only).
2. `docs.google.com/forms/.../formResponse` — **only on contact-form submit**, from `index.html`.
3. `script.google.com/macros/.../exec` — **only on onboarding-form submit**, from `onboarding.html`.

No analytics, no advertising, no tracking pixels, no third-party JS. The site sets
no cookies of its own. This is documented in the Privacy Policy; if that ever
changes, update the Privacy Policy in the same commit.

## Before making changes

- **Pricing is estimate-only.** Setups typically around $5,000, running cost about
  $2,000/month, always framed as an estimate confirmed on a call. Price depends on
  **scope** (what we connect, how many workflows) — never on the client's income or
  size. Do not add a fixed price, a guarantee, or a discount offer.
- **Everything is approval-gated.** Copy must never imply the AI acts on its own.
- **No unsupported claims.** No numbers without a source, no superlatives, no
  "guaranteed", and no implied scale ("our team", "our clients") — this is a
  one-person business with one named client reference.
- The client reference (Samson Folau, Malosi Solutions) is used with permission and
  quoted verbatim. Do not edit the quote, add a star rating, or present it as a
  review-platform review.

## Deploy (GitHub Pages)

Push to `main`; Pages serves from the repo root. The `CNAME` file keeps the custom
domain across deploys. DNS: four A records for the apex
(`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`) and a `www` CNAME to
`<username>.github.io`. Enable **Enforce HTTPS** once the certificate is issued.
