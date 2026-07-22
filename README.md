# Oyzla Leads — Static Website

Complete static site for **oyzlaleads.com**. No build step, no server, no external
dependencies — every page is a single self-contained HTML file with inline CSS/JS.

## File structure

| File | Purpose |
|---|---|
| `index.html` | Approved homepage. All primary CTAs go to the live Stripe founding checkout. |
| `terms-of-service.html` | Terms of Service (**DRAFT** — reconcile with the existing Sept-2025 ToS on Wix and have an attorney review before publishing). |
| `privacy-policy.html` | Privacy Policy (**DRAFT** — same reconciliation/attorney note applies). |
| `onboarding.html` | Post-payment questionnaire ("Payment confirmed — let's set up your territory"). Collects agency name/email, territory, insurance lines, and CRM info, then POSTs JSON to a webhook. |
| `CNAME` | GitHub Pages custom-domain file. Contains exactly `oyzlaleads.com`. |
| `favicon.svg` / `favicon-48.png` | Oyzla logomark favicon (SVG + PNG fallback), referenced from every page. |
| `apple-touch-icon.png` | 180×180 icon for iOS home screen / Google result icon; also the Organization logo in JSON-LD. |
| `og-image.png` | 1200×630 branded share image for Open Graph / Twitter cards. |
| `previews/` | Rendered full-page previews (home desktop/mobile, onboarding mobile). Not needed in production. |
| `README.md` | This file. |

> Logo note: the logomark is a simple inline SVG (blue rounded square, white ring,
> orange dot) used in the header/footer of every page. If there is an official
> Oyzla logo file, swap it into the same spots: the inline `<svg class="mark">` in
> each page's header/footer, plus `favicon.svg`, `favicon-48.png`,
> `apple-touch-icon.png`, and `og-image.png`.

## Before go-live (required)

1. **Onboarding webhook** — in `onboarding.html`, find the CONFIG block at the top
   of the `<script>` and replace
   `const BACKEND_WEBHOOK_URL = "REPLACE_WITH_APPS_SCRIPT_WEBHOOK_URL";`
   with the real Google Apps Script Web App URL (or any endpoint accepting a JSON POST).
   Until then the form shows the thank-you screen but sends nothing.
2. **Legal review** — both legal pages are drafts; reconcile with the existing
   Sept-2025 ToS/Privacy currently on Wix and have an attorney review.
3. **Stripe success URL** — in the Stripe payment link settings, set the
   post-checkout redirect to `https://oyzlaleads.com/onboarding.html` so customers
   land on the questionnaire after paying.
4. **Chat widget** — the bottom-right chat bubble on the homepage is a visual
   placeholder; wire in the real chat widget's embed snippet if desired.

## Deploy to GitHub Pages

1. **Create the repo.** On github.com, create a new public repository
   (e.g., `oyzla-site`).
2. **Push these files** (everything in this folder, at the repo root):
   ```bash
   cd /Users/mataif/Downloads/oyzla-site
   git init
   git add .
   git commit -m "Oyzla Leads static site"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/oyzla-site.git
   git push -u origin main
   ```
3. **Enable Pages.** In the repo: **Settings → Pages** → under *Build and
   deployment*, set **Source: Deploy from a branch**, **Branch: `main`**,
   folder **`/ (root)`** → Save.
4. **Set the custom domain.** Still in **Settings → Pages**, enter
   `oyzlaleads.com` in the *Custom domain* field and save. (The `CNAME` file in
   the repo keeps this setting across deploys.) Once DNS resolves, check
   **Enforce HTTPS**.

## DNS records (at your domain registrar)

Point the domain at GitHub Pages:

**Apex domain (`oyzlaleads.com`) — four A records:**

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

**`www` subdomain — one CNAME record:**

| Type | Host | Value |
|---|---|---|
| CNAME | www | `<YOUR-USERNAME>.github.io` |

DNS changes can take up to 24–48 hours to propagate, though it's usually much
faster. After propagation, GitHub will provision the HTTPS certificate
(this can take up to an hour); then enable **Enforce HTTPS**.

> Note: if the domain currently points at Wix, remove/replace the existing Wix
> A/CNAME records when you're ready to cut over.
