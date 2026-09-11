# Oyzla AI — Website Compliance, Accessibility & Credibility Audit

**Date:** 11 September 2026 · **Updated same day:** owner is in **Utah**, not Arizona — location, governing law and the counsel list below were corrected accordingly. `onboarding.html` has been retired to a redirect stub (legacy copy in `_to_delete/`).
**Scope:** `index.html`, `onboarding.html`, `privacy-policy.html`, `terms-of-service.html`, `refund-policy.html`, `README.md`
**Site:** oyzlaleads.com (legacy domain; business is Oyzla AI) — static, GitHub Pages
**Baseline commit:** `03ebeed`

> **I am not a lawyer.** Everything in the legal pages is plain-English drafting.
> Anything marked *needs counsel* must be reviewed by an attorney before you rely on it.
> No business fact has been invented — every unknown is a bracketed placeholder.

---

## 0. Pricing change (done first)

| Was | Now |
|---|---|
| `~$2,500` to build + `~$1,500/mo` | `~$5,000` typical setup + `~$2,000/mo`, both labelled **estimate** |
| "Save 20% — bundle 2 or more services and take 20% off your setup" | **Removed entirely.** Replaced with a neutral note that combined scope is estimated on the same call, as one quote |
| "Half the cost of a hire… employee $3,000+/mo… AI $1,500/mo flat… about 50% less" | "A loaded in-house admin typically runs around **$6,000/month**. A virtual assistant usually lands between **$2,000 and $8,000/month**. Oyzla is typically **about $2,000/month**, works around the clock… All figures are estimates and will vary with your scope." |
| Four service cards had commented-out old prices in the source | Replaced with a live "Estimated on a call — typical setup ~$5,000 · ~$2,000/mo — estimate, varies with scope" line on each |
| Custom AI Build: "Scoped & quoted per project" | "Scoped & **estimated** per project — no standard figure, scope decides it" |

Price is attributed to **scope** everywhere ("what we connect and how many workflows"). The site never says price depends on the client's income, revenue, or size — I checked; it never did, and nothing added implies it. Terms §1a now states in writing that website figures are estimates and not offers.

---

## 1. Checklist

| # | Item | Status | Note |
|---|---|---|---|
| 0 | Pricing → ~$5,000 setup / ~$2,000 mo, estimate-framed | **fixed** | `index.html` price band, comparison box, all 5 service cards, contact copy, success message |
| 0 | Remove 20% bundle offer | **fixed** | `.bundle` markup and CSS deleted |
| 0 | Price depends on scope, never client size/income | **fixed** | Stated on the page and in Terms §1a |
| 1 | Cookies policy | **fixed** | No separate policy or banner needed — site sets no cookies. Added Privacy §3 "Cookies and tracking" naming Google Fonts, the Google Form submit, and GitHub Pages logs |
| 1 | Effective dates on all three policies | **fixed** | Were "Last updated: August 2026" with no effective date. Now "Effective date: 11 September 2026" on all three |
| 1 | Legal name + contact on policies | **needs owner** | Placeholder `[Oyzla AI — legal entity name]` and `[City], Arizona` added to all three + both footers. Email `oyzla.ai@gmail.com` present throughout |
| 1 | Data collected — exact contact-form fields | **fixed** | Privacy §1 lists name, business name, email, optional phone, message, consent tick — and says "and nothing else" |
| 1 | Why collected / lawful purpose | **fixed** | Privacy §2, incl. an explicit "we won't newsletter you from this form" |
| 1 | How long kept | **fixed** | Privacy §5: enquiries 24 months, client/project records 7 years, then deleted |
| 1 | Who it's shared with | **fixed** | Privacy §4 names Google (Forms/Sheets/Gmail), GitHub Pages, hosting/AI providers, professional advisers. Explicit "we do not sell" |
| 1 | User rights (access / deletion by email) | **fixed** | Privacy §7 — access, correct, delete, stop contact; 30-day target; no charge, no penalty |
| 1 | Children | **fixed** | Privacy §8 and Terms preamble — B2B, not directed at under-18s |
| 1 | Governing law | **needs counsel** | Privacy §9, Terms §9a — `[State]` / `[County/State]` placeholders. Terms §9a also flags whether to add arbitration / fee-shifting |
| 1 | Refund policy matches the managed-service model | **fixed** | New "How we charge" section (setup + monthly). Existing 50/50 setup and cancel-anytime terms retained |
| 1 | Refund policy says what happens to the live system when they stop paying | **fixed** | This was the biggest gap. New section spells out item by item that the tools **stop working**: hosting/monitoring end, assistants and automations are switched off, the build stays ours, connections are revoked — and what the client keeps. Mirrored in Terms §9 |
| 1 | Terms must not promise outcomes | **fixed** | New Terms §7a "No promised results" (no lead/booking/hours-saved/revenue promise; timelines are expectations). §7 softened from "do not guarantee uninterrupted availability" to "no SLA unless written into your order" |
| 1 | Anything reading as a guarantee | **fixed** | See §5 below — no "guarantee" claim remains anywhere on the site |
| 2 | Consent checkbox on the contact form | **fixed** | Required checkbox + Privacy Policy link; JS blocks submit and focuses the box with a `role="alert"` message. Nothing is POSTed to Google without the tick |
| 2 | Only necessary fields collected | **fixed** | Phone was `required` — now optional and labelled "only if you'd rather we called". Name, business, email, message retained; nothing added |
| 2 | Onboarding form checked the same way | **fixed** | Same consent checkbox on step 1, validated on advance **and** re-validated on submit so it can't be bypassed |
| 3 | No analytics / tracking scripts | **fine as-is** | Confirmed: zero third-party JS, zero pixels, zero analytics, no cookies set by the site. Stated in Privacy §1 and §3. Full request list in §4 below |
| 4 | Images / SVGs have alt or aria-hidden | **fixed** | No `<img>` elements exist anywhere. Every inline SVG is decorative and now carries `aria-hidden="true"` (3 hero icons and the chat send icon were missing it) |
| 4 | Colour contrast WCAG AA | **fixed** | 3 failures found and fixed — see §3 below |
| 4 | Every form field has `<label for>` | **fine as-is** | Verified by script across both forms — all pass, including the new consent boxes |
| 4 | Visible focus states | **fixed** | There were none beyond browser defaults, and inputs used `outline:none`. Added `:focus-visible` rings on all five pages, with a light variant on dark sections |
| 4 | Chat demo + chips keyboard-operable, accessible names | **fixed** | Chips were already real `<button>`s (tab + Enter/Space work). Added `role="group"` + `aria-label` to each chip set, `role="region"` + a descriptive label on the widget, `type="button"` and `aria-hidden` icon on Send |
| 4 | Skip link to main | **fixed** | Added to all five pages, with `tabindex="-1"` on the target |
| 4 | `lang` attribute | **fine as-is** | `lang="en"` present on all five pages |
| 4 | Heading order | **fine as-is** | Verified: one `<h1>` per page, no skipped levels |
| 4 | Buttons say what they do | **fixed** | "Send it — we'll call you back." → **"Send enquiry"** (the old label promised a call even when no phone was given). Nav "Pricing" → "Services & pricing" |
| 5 | Testimonial not presented as a review-platform review | **fixed** | No star rating existed. Eyebrow "One of our top clients" → **"Client reference"**, plus a line saying it's a permissioned direct quote, not a review-platform rating. **The quote itself is untouched, verbatim** |
| 5 | Unsupported claims removed | **fixed** | See §5 |
| 5 | Copy consistent with draft/approval-gated | **fixed** | See §5 |
| 5 | Chat demo clearly a scripted demo | **fixed** | Chip "Demo" → "Scripted demo"; section intro and footnote now say it's scripted, that "Summit Plumbing" is invented, and that its prices/policies are illustrative |
| 6 | Footer business details | **needs owner** | Footer now carries a legal-name placeholder, `[City], Arizona`, `oyzla.ai@gmail.com`, and links to all three policies. Two placeholders to fill — see §2 |
| 7 | Image asset origins | **fine as-is** | No raster assets exist. See §6 |
| 8 | Arizona / US small-business items | **needs counsel** | See §7 |
| 9 | Other risks | **mixed** | See §8 — one is significant |

---

## 2. Placeholders — FILLED 2026-09-11 (evening)

All filled from the owner: legal name **Oyzla Leads LLC** (the existing LLC, trading as Oyzla AI — confirm the exact registered form against the Utah Division of Corporations record, e.g. "LLC" vs "L.L.C."), **Saratoga Springs, Utah**, venue **Utah County**. Samson Folau / Malosi Solutions corrected to **Saratoga Springs, UT** (was wrongly "NY"). The leads Sheet is owner-only. Retention periods kept at 24 months / 7 years. Original table kept below for the record.

### Original placeholder table

Search the repo for `[` to find them all. **Do not publish invented details.**

| Placeholder | Where | What's needed |
|---|---|---|
| `[Oyzla AI — legal entity name]` | index footer, all 3 policy footers + policy bodies, onboarding footer | Your registered legal name — e.g. "Oyzla AI LLC", or your own name if you're a sole proprietor. If you have no registered entity, say so honestly ("Oyzla AI is a sole proprietorship operated by …") |
| `[City]`, Utah | index footer, all 3 policies | The Utah city you operate from. A city + state is enough; you don't have to publish a home street address |
| Governing law | Privacy §9, Terms §9a | **Set to the State of Utah.** Confirm with counsel |
| `[County]`, Utah | Terms §9a | Venue county (e.g. Salt Lake / Utah County), and whether to add an arbitration clause |

**Also for you to decide, not fillable by me:**

1. **`onboarding.html` — retire it or rewrite it.** See §8.1. This is the most important item on the page.
2. **`CNAME` is `oyzlaleads.com`** while the business is Oyzla AI. Known legacy, but every policy now says "when you visit oyzlaleads.com" — if you move to an oyzla.ai domain, update that line in the Privacy Policy.
3. **`favicon.svg`** is the old *Oyzla Leads* mark (blue ring on navy), not the current Oyzla AI mark. Only `onboarding.html` loads it.
4. **Retention periods** in Privacy §5 (24 months / 7 years) are sensible defaults I chose. Confirm they match what you'll actually do — a policy you don't follow is worse than none.
5. **The Google Form** behind the contact form is owned by `oyzla.ai@gmail.com`. Confirm the Sheet isn't shared beyond you, since the Privacy Policy now promises limited access.

---

## 3. Colour contrast results (computed, WCAG 2.1 AA)

Normal text needs 4.5:1, large/bold text and UI icons 3:1.

**Failures found and fixed:**

| Element | Before | After |
|---|---|---|
| Footer copyright `#6C7194` on navy `#0C1024` | **3.97 FAIL** | `#8A8FB0` → **5.95 PASS** |
| "Ready" badge green `#16A34A` on `#EAF7EF` | **2.99 FAIL** | `#15803D` → **4.55 PASS** |
| Onboarding input placeholder `#949db2` on `#fbfcff` | **2.65 FAIL** | `#6b7385` → **4.64 PASS** |

**Passing (verified, unchanged):** body text 18.19 · `--ink-soft` 9.83 · muted on white 5.33 / on tint 4.98 / on chat 5.02 / on brand-soft 4.70 · brand eyebrow 6.29 / 5.88 · primary button 6.29 · ghost button 18.19 · chip 6.29 · trust strip 18.83, bold 9.90 · demo sub 8.35 · demo points 11.86 · demo note 5.95 · dark "vs" box body 14.74 and highlight 8.95 · dark service card 7.14 · footer links 8.35 · policy body 12.38 · policy muted 5.33 / note 4.98 / links 6.29 · onboarding muted 5.56 / ink-2 12.67.

**New elements, all passing:** footer legal block 5.95 · form error `#B02020` 6.83 · estimate caption on white 5.33 / on dark card 7.14 · onboarding error 7.23 · skip link 6.29 · consent label 9.83.

Every colour pair in the CSS now meets AA.

---

## 4. External requests the site makes

Complete list. **No analytics, no advertising, no tracking pixels, no third-party JavaScript, no cookies set by this site.**

| # | Request | Page | When | Why |
|---|---|---|---|---|
| 1 | `https://fonts.googleapis.com/css2?family=Inter…&family=Sora…` | `index.html` | Every page load | Webfont stylesheet |
| 2 | `https://fonts.gstatic.com/…` | `index.html` | Every page load | The font files themselves |
| 3 | `https://docs.google.com/forms/d/e/1FAIpQLSc-…/formResponse` | `index.html` | **Only on contact-form submit** — POST via hidden iframe | Lands the enquiry in your leads Sheet |
| 4 | `https://script.google.com/macros/s/AKfycbz…/exec?source=onboarding` | `onboarding.html` | **Only on onboarding submit** — `no-cors` POST | Apps Script webhook |

`onboarding.html` loads no webfont (it uses system fonts). Requests 1 and 2 send the visitor's IP and user-agent to Google on every page view — now disclosed in Privacy §3. If you ever want zero third-party requests on load, self-host the two fonts; that's the only change needed to make the site fully self-contained.

Two dead references were removed from `onboarding.html`: `favicon-48.png` and `apple-touch-icon.png` (neither file exists — both 404'd on every load).

---

## 5. Claims removed or softened

| Was | Now | Why |
|---|---|---|
| "One of our top clients" | "Client reference" | Implies a roster; there is one named reference |
| "Half the cost of a hire… about 50% less" | Removed; replaced with the estimate-framed comparison | An unsubstantiated savings claim tied to a fixed price |
| "Live in days" (×5: hero note, trust strip, commitments heading + body, chat script) | "**Most builds** go live in days" / "**Usually** live in days" + "Bigger builds take longer, and we'll say so up front" | Read as a delivery promise |
| "We'll reply within a day with a plan and a price" | "We **usually** reply within one business day with what we'd build and **an estimate**" | Promise + implied fixed price |
| "for businesses of every kind" / "for any business" (incl. meta description) | "for small businesses" | Implied scale and capability breadth |
| "answered and booked while the office slept" · badge "Answered & booked" | "answered from your own FAQ, with the booking request waiting for you in the morning" · "Answered · booking to confirm" | Implied the AI books autonomously |
| "line items read, coded, and filed in your books" · badge "Filed automatically" | "read and coded, **drafted** for your books. You approve; **nothing files itself**" · "Ready for approval" | Same — this is the approval-gated model |
| "Books the next step while you sleep" | "**Captures** the next step while you sleep — **you confirm it**" | Same |
| "books the next step" (Website Assistant card) | "**captures** the next step **for you to confirm**" | Same |
| "You just get the results" (×2) | "Anything it sends or files on your behalf comes to you as a draft to approve first" / "You stay in control of what goes out" | Same |
| "watch it daily" | "keep an eye on it" | A daily-monitoring commitment for a one-person business |
| "pinged the on-call technician — you'll get a call back within 15 minutes" (demo) | "flagged this as urgent for the on-call technician so they can call you straight back" | A specific response-time number in a demo |
| "(That part's real, not scripted.)" | "(That part's a real description of what we do; this conversation is still scripted.)" | Ambiguous — could read as a live AI |
| Button "Send it — we'll call you back." | "**Send enquiry**" | Promised a call even when no phone number was given |
| "no pressure, **no payment up front**" | "No obligation, and nothing is charged from this form" | Contradicted Terms §4 (50% deposit to begin work) |
| Four commented-out old prices in the HTML source | Removed | Stale prices readable in view-source |

**Checked for and not present:** "guaranteed", "best", "#1", "leading", "proven", "trusted by hundreds", "our team", "our clients", any hours-saved or percentage figure, any star rating, any client logo wall. "Our promise" (nav/section) is fine — it introduces commitments about conduct, not outcomes. "24/7"/"around the clock" is kept: it's a true statement about software availability, and the pricing comparison relies on it.

**The testimonial is untouched.** Quote verbatim, attribution unchanged (Samson Folau, Malosi Solutions · Saratoga Springs, NY). Only the framing around it changed.

---

## 6. Image and asset inventory

| Asset | Type | Origin | Risk |
|---|---|---|---|
| Oyzla AI logomark (header, footer, chat avatar) | Inline SVG, ~6 primitives | Original — a rounded square, a dashed ring, two circles | None |
| Favicon on `index` + 3 policy pages | Inline `data:` URI SVG, same mark | Original | None |
| `favicon.svg` (file) | SVG | Old **Oyzla Leads** mark (navy tile, blue open ring). Only `onboarding.html` uses it | Brand inconsistency, not legal |
| ~25 UI icons (shield, lock, clock, chat bubble, document, calendar, pencil, quote mark, checkmarks, send arrow) | Inline SVG paths | Generic single-path outline glyphs in a common 24×24 stroke style, drawn inline. No library, no attribution comment, no stock watermark | Low. Simple geometric glyphs like these generally aren't protectable, but see below |
| Client avatar "SF" | CSS gradient + initials, no photo | Original | None |

**No raster images exist in this repo.** There is no `og-image.png`, `apple-touch-icon.png`, or `favicon-48.png` — the old README claimed all three; they were never committed. Nothing here looks like licensed stock.

**Two notes:** (1) The site has **no Open Graph or Twitter card image**, so links shared to social or messaging apps render bare. Worth adding your own. (2) If any of those 24×24 icons was pasted from an icon set (Feather, Lucide, Heroicons), those are MIT/permissive but usually want an attribution line — you'd know their origin better than I can tell from the paths. If you drew them, nothing to do.

---

## 7. For counsel — Utah / US small business selling B2B services online

One line each. All of these are *confirm with an attorney or your CPA*, not conclusions.

1. **Entity and legal name** — the entity is **Oyzla Leads LLC**, now shown on the site as "Oyzla Leads LLC, trading as Oyzla AI". Using one LLC for a renamed business is normal, but Utah requires an assumed-name (DBA) registration with the Division of Corporations & Commercial Code if you trade under a name that isn't your legal name; confirm whether the legal name must appear on the site, invoices and contracts.
2. **Utah sales tax** — Utah taxes remotely-accessed prewritten software (SaaS) but generally not custom software or professional services; a monthly hosted-tool subscription can fall on the taxable side. Ask a CPA whether the setup fee (service) and the monthly (hosted software) should be treated differently, and whether you need a Utah sales-tax license.
3. **Economic nexus in client states** — if you take clients outside Arizona, whether their state's sales-tax rules on SaaS reach you.
4. **CAN-SPAM** — any commercial email follow-up (cold outreach especially) needs accurate headers and subject, a physical postal address, and a working opt-out honoured within 10 business days. Note the postal-address requirement conflicts with keeping your home address private; ask about a registered agent or PO box.
5. **TCPA** — if you ever text or call with any automated dialler or pre-recorded message, prior express written consent is required and penalties are per-message. The current contact form's consent tick covers being contacted about the enquiry; it is **not** consent for automated marketing texts. Also check Utah's telephone-solicitation rules (Utah has its own registration requirements for telephone soliciting).
6. **FTC guidance on AI claims** — the FTC has been explicit about unsubstantiated AI performance claims ("Keep your AI claims in check"). The site now avoids performance numbers; keep it that way, and be able to substantiate anything you do add.
7. **FTC endorsement rules** — the testimonial is a real, permissioned client. Keep written proof of permission on file, and if the relationship is ever anything other than a paying client (discount, referral fee, family), that connection must be disclosed.
8. **Refund policy vs Terms consistency** — I aligned them (setup 50/50, cancel-anytime monthly, service ends on cancellation, Terms control on conflict). Have counsel confirm the pair actually agree and that the liability cap in Terms §8 is enforceable in your state.
9. **Negative-option / auto-renewal rules** — the monthly fee auto-renews. Federal and several state auto-renewal statutes require clear pre-checkout disclosure and an easy cancellation path. Cancellation is by email today; confirm that's sufficient.
10. **State privacy laws** — the Utah Consumer Privacy Act applies only above $25M revenue / large data volumes, so not today; California, Colorado, Virginia, Texas and others have their own thresholds you're unlikely to hit yet. Worth a five-minute check as you grow.
11. **Professional liability / E&O insurance** — not a legal requirement, but the Terms §8 liability cap only helps so much when an automation touches a client's invoicing or customer comms.
12. **Client data and confidentiality** — you'll hold client business data and connect to their systems; ask whether you need a written DPA or confidentiality addendum, especially for any client in a regulated field.

---

## 8. Other risks found

### 8.1 `onboarding.html` sold a product you no longer offer — **RESOLVED: retired to a redirect stub**

The page is a complete, live artefact of the retired **"Oyzla Leads"** business: exclusive insurance-lead territories sold through a Stripe checkout. It says **"Payment confirmed"**, promises **"One agency per area"** and **"Never shared"**, offers to **refund the first payment** if a territory is taken, offers a **free CRM setup**, and listed **Saratoga Springs, Utah** and **info@oyzlaleads.com** as the business's location and contact — neither matching Oyzla AI. It POSTs to a live Google Apps Script webhook.

It is `noindex` and unlinked from the homepage, but it is publicly reachable at `oyzlaleads.com/onboarding.html`, and the territory-refund promise is **not covered by the current Terms of Service or Refund Policy** — a page promising a refund your policies don't provide for is the clearest legal exposure on the site.

*What I did:* safety fixes only — consent checkbox, accessibility, removed the two 404 asset links and the dead `#pricing` anchors, replaced the Utah location and dead email with the Arizona placeholder and `oyzla.ai@gmail.com`, and put a loud comment at the top of the file. **I did not rewrite the offer**, because doing so would mean inventing an onboarding flow you haven't defined.

*Resolved:* the page is now a `noindex` stub that redirects to `/` after 0 s, so the old Stripe success URL and any bookmarks still resolve without showing the dead offer. The legacy page is preserved at `_to_delete/onboarding-oyzla-leads-legacy.html`. **Still to do:** repoint the old Stripe product's success URL (or archive the product) so nobody is sent here by a checkout.

### 8.2 The contact form POSTs to Google before anything is confirmed
The submission is fire-and-forget through a hidden iframe: the success screen shows whether or not Google accepted it. If the POST silently fails, the visitor believes they've contacted you and you never see it. **Fix:** periodically check the leads Sheet against what you'd expect, or move to a webhook you can verify. Not a compliance issue, a lost-business one.

### 8.3 Terms §2 — IP position is strong; make sure it's said out loud
Terms §2 keeps the entire build (configurations, prompts, code, infrastructure) as Oyzla AI's property, and Refund now states plainly that everything stops on cancellation. That's a legitimate managed-service model and it's now disclosed clearly rather than buried. Just make sure you say it verbally on the scoping call too — a client who thinks they're buying an asset and discovers they were renting one is where disputes start.

### 8.4 No Open Graph / Twitter card metadata
Shared links render bare. Cosmetic, but it reads as unfinished to a prospect. Needs an `og:image` you own.

### 8.5 Legacy naming throughout
`CNAME` is `oyzlaleads.com`, `favicon.svg` is the old mark, the README described the old business (now rewritten). A prospect who inspects the site sees a different company name in the URL bar than on the page. Worth resolving before any outbound push.

### 8.6 Chat demo contains invented business facts
The scripted demo quotes a "$95 dispatch fee", "$1,400–$2,100" water-heater pricing, named brands (Rheem, Bradford White, Navien, Rinnai) and a "2-year labor warranty" for a fictional "Summit Plumbing". It's now labelled three times as scripted with an invented sample business and illustrative figures, which should be enough — but if you'd rather remove the brand names entirely, they're in the `script` object in `index.html`.

---

## 9. Verification run

- **HTML validity** — `npx html-validate` across all five pages: **0 errors** with stylistic rules (inline styles, self-closing voids, intentional shared checkbox `name`) disabled. The default preset's remaining 45 findings are all pre-existing stylistic preferences, not markup errors.
- **Internal links and anchors** — scripted check of every non-external `href` on all five pages: **all resolve.** Fixed two dead `#pricing` anchors in `onboarding.html`.
- **Duplicate IDs** — none on any page. Fixed a duplicated `omark` SVG gradient id in `onboarding.html`.
- **Form labelling** — scripted check of every visible form control on both forms: **all labelled.**
- **Heading order** — one `<h1>` per page, no skipped levels, on all five pages.
- **Contrast** — 41 colour pairs computed; 3 failures found, all fixed; all now pass AA.

## 10. Commits

| Commit | Contents |
|---|---|
| `03ebeed` | Baseline (pre-audit) |
| `a594a8c` | Landing page: pricing, bundle removal, claims, consent, accessibility, contrast, footer |
| `e3c6b46` | Legal pages: effective dates, cookies section, retention, rights, governing-law placeholders |
| `ced9e2e` | Onboarding page + README: consent, accessibility, dead references, legacy flag |
