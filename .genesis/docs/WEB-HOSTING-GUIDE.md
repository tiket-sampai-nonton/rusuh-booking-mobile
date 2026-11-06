# Web Hosting Guide — Rusuh Booking Tiket (Front-End)

> **Status:** Reference guide for deploying the React Native Web export to a public host.
> **Scope:** FRONT-END web deployment only. Backend hosting is a separate team's concern.
> **Audience:** Written step-by-step for a first-time deployer. No prior hosting experience assumed.
> **Dashboard version:** Cloudflare dashboard as of 2026 (the UI changes often — if a label
> differs slightly, look for the closest match; the flow is the same).
> **Architecture reference:** `.genesis/docs/ARCHITECTURE.md`, `.genesis/docs/PIPELINE.md`

---

## 1. Context — why these choices

The FE ships as an **Expo static web export** (`app.config.js` → `web.output: "static"`).
Running `npx expo export --platform web` produces plain HTML/CSS/JS files in `apps/client/dist`.
Hosting the web app is therefore a **static site + CDN** problem — not a Node server — so the
cheapest, most scalable options apply.

**Launch load:** ~300k users at ticket on-sale, then tapering. For a static export the heavy,
bursty load lands on the **backend** (queue, inventory, payment), not the web host. The web host
only serves files. Estimated launch-day egress: ~450 GB–1 TB (300k × ~1–2 MB/session, higher
with refresh-happy users in a ticket rush).

### Hosting decision

| Option | Bandwidth cap | Commercial on free tier? | Fit for static Expo export | Spike survivability |
|---|---|---|---|---|
| **Cloudflare Pages** ✅ chosen | **Unlimited** | Yes | Excellent | Best |
| Netlify Free | 100 GB hard cap (site pauses) | Yes | Good | Pauses mid-sale ❌ |
| Vercel Hobby | 100 GB | No (commercial prohibited) | Overkill for static | Disqualified ❌ |

**Chosen: Cloudflare Pages (free tier).** Only option whose free tier survives a 300k spike
(unlimited bandwidth), allows commercial use, serves from a global edge CDN, and adds free
DDoS/WAF protection in front of a bot-prone ticket drop. Sources (2026):
[Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits),
[Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/),
[Netlify pricing](https://www.netlify.com/pricing/pro-vs-free/),
[Vercel fair-use](https://vercel.com/docs/limits/fair-use-guidelines). Content rephrased for licensing compliance.

### Two design constraints to stay free and fast
1. **Keep public routes `web.output: "static"`** (already set). This keeps serving on the free
   unlimited-bandwidth static path and off the Workers Functions quota (100k req/day).
2. **Browser calls the BE directly** via `EXPO_PUBLIC_API_BASE_URL` for transactional routes.
   The web host only serves files; coordinate real capacity with the BE team.

---

## 2. Is Cloudflare a hosting service? Yes — and which product to use

"Cloudflare" is a company with several products. A few relate to hosting; you only need **one**.

| Cloudflare product | What it is | Use it for your website? |
|---|---|---|
| **Cloudflare Pages** | Hosting for static / front-end sites: **store + CDN + HTTPS + auto-deploy from Git**, all in one | ✅ **Yes — this is the one** |
| Cloudflare Workers | Runs small server-side code at the edge (serverless functions) | Only for backend-style logic, not needed here |
| R2 | Object storage (Cloudflare's S3 competitor) — stores files only, not a web host | ❌ No |
| CDN / DNS / WAF | Speeds up & protects a site hosted elsewhere | ❌ Already bundled inside Pages |

**Cloudflare Pages = hosting service.** It is a direct competitor to Netlify and Vercel.
Everything below happens inside Cloudflare Pages; no other Cloudflare product is required.

### Why not S3? (a common friend-recommendation)
The classic AWS pattern is **S3 (storage) + CloudFront (CDN)** — *two* services you wire together,
and **AWS bills for bandwidth** (~$0.085/GB → roughly **$40–85 for one 300k launch day**).
Cloudflare Pages bundles storage + CDN into one product with **free unlimited bandwidth**, so
putting S3 in front of (or instead of) Pages would be a pricier, more complex duplicate. Use S3
only if your whole infra is already on AWS, or for a separate storage need (uploads/media) — not
for hosting this static site.

---

## 3. How it fits together (the flow)

### Recommended flow — Cloudflare builds, stores, and serves (Git integration)

```
┌──────────────┐
│  YOUR LAPTOP │   git push
│  src/ code   │────────────┐
│  (no dist/)  │            │
└──────────────┘            ▼
                     ┌───────────────┐
                     │    GitHub      │
                     │  source only   │
                     └───────┬────────┘
                             │ Cloudflare pulls the repo on every push
                             ▼
          ┌──────────────────────────────────────┐
          │            CLOUDFLARE PAGES           │
          │  1. BUILD   npx expo export → dist/   │
          │  2. STORE   keeps dist/ as a          │
          │             versioned "deployment"    │
          │  3. SERVE   pushes files to the       │
          │             global edge CDN + HTTPS    │
          └──────────────────┬────────────────────┘
                             │ HTTPS
                             ▼
                    ┌─────────────────┐
                    │   300k USERS    │
                    └─────────────────┘
```

### Where the build artifact (`dist/`) lives

```
  LOCATION           HAS dist/ ?        PURPOSE
  ──────────────────────────────────────────────────────────────
  Your laptop        temporary          local testing only (throwaway)
  GitHub repo        NO (.gitignored)   source code only — never commit dist/
  Build server (CF)  built fresh here   produced during each build
  Cloudflare CDN     YES (final)        what users actually download
  ──────────────────────────────────────────────────────────────
```

Mental model: `source code ──build──▶ dist/ (artifact) ──store/serve──▶ users`.
You never manually "upload" or "store" `dist/` — **deploying to Pages *is* the storing.**
`dist/` is already gitignored in this repo, which is correct.

---

## 4. Domain decision

Free host subdomains (`*.pages.dev`) are production-grade HTTPS — fine for dev/staging.
For a **commercial, payment-taking** production app, register a real domain (~$10/yr):

- Free sketchy TLDs (`.tk`, `.ml`, etc.) — **do not use**: distrusted by browsers/email, poor
  SEO, can be revoked without notice. Catastrophic for a payment app.
- `js.org` / `is-a.dev` — for open-source/personal only; not appropriate for a storefront.
- **Buy via Cloudflare Registrar** (wholesale, no markup; DNS auto-wires to Pages).

| Environment | Branch | Domain | Cost |
|---|---|---|---|
| Development / preview | `develop` + feature branches | auto `*.pages.dev` | $0 |
| Production | `main` | `rusuhtiket.com` (or `.id`) | ~$10/yr |

Hosting stays on the free tier throughout; the only spend is the domain.

---

## 5. Phase A — Create the Cloudflare account

1. Open a browser and go to **https://dash.cloudflare.com/sign-up**.
2. Enter your email and a password, then click **Sign Up**.
3. Open the verification email from Cloudflare and click the confirm link.
4. You now land on the Cloudflare dashboard home. **No credit card is required for Pages.**

---

## 6. Phase B — Test the build locally first

Confirm the website files generate correctly on your machine *before* involving Cloudflare.

1. Open your terminal.
2. Move into the app folder:
   ```bash
   cd apps/client
   ```
3. Build the static web export (creates `apps/client/dist`):
   ```bash
   npx expo export --platform web
   ```
   Wait until it finishes — the last line mentions `Exported: dist`.
4. Preview it locally and click around:
   ```bash
   npx expo serve
   ```
   Open the printed URL (usually `http://localhost:8081`). If pages load and navigation works,
   the build is good. Press `Ctrl+C` to stop.

> Note: there is no `web:build` script in `package.json` yet — use the full command above.
> Adding a script is a separate team decision and is not required to deploy.

---

## 7. Phase C — Deploy to Cloudflare Pages (free `*.pages.dev` URL)

The repo is already on GitHub at `tiket-sampai-nonton/rusuh-booking-mobile`, so use Git integration.

### C1. Start a new Pages project
1. In the Cloudflare dashboard, open the left sidebar and click **Workers & Pages**.
2. Click the **Create** button (top right).
3. On the page that opens, choose the **Pages** tab.
4. Click **Connect to Git**.
   *(In the 2026 UI this whole path may read **Create application → Pages → Connect to Git**.)*

### C2. Authorize GitHub and pick the repo
5. Click **Connect GitHub** (first time only) and sign in to GitHub.
6. When GitHub asks which repositories to grant access to, select
   **`tiket-sampai-nonton/rusuh-booking-mobile`** (or "All repositories"), then **Install & Authorize**.
7. Back in Cloudflare, select that repository from the list, then click **Begin setup**.

### C3. Configure the build (this is the important screen)
Enter these values exactly:

| Field | Value | Why |
|---|---|---|
| **Project name** | `rusuh-booking` | Becomes `rusuh-booking.pages.dev` |
| **Production branch** | `main` | Matches PIPELINE.md (prod = `main`) |
| **Framework preset** | `None` | It's a plain static export |
| **Build command** | `npx expo export --platform web` | Produces `dist/` |
| **Build output directory** | `dist` | The folder Cloudflare serves |
| **Root directory** *(open "Advanced" / "Build settings")* | `apps/client` | **Required** — the app lives in a subfolder, not the repo root |

> If you skip **Root directory = `apps/client`**, the build fails because Cloudflare would look
> for the app at the repo root. This is the #1 mistake for monorepos.

### C4. Add environment variables
Still on the setup screen, find **Environment variables** and add these (from `.env.example`):

| Variable | Value |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | your **production** backend URL |
| `EXPO_PUBLIC_ENV` | `production` |
| `EXPO_PUBLIC_USE_MOCKS` | `false` |

Never paste real secrets here — `EXPO_PUBLIC_*` values are shipped to the browser. These are
public config only (per SECURITY.md / PIPELINE.md §10).

### C5. Deploy and verify
8. Click **Save and Deploy**.
9. Watch the build log stream. First build takes a few minutes.
10. When it finishes, Cloudflare shows a live URL like **`https://rusuh-booking.pages.dev`**.
    Open it and click through a few pages to confirm it works.

### C6. Branch → environment mapping (matches PIPELINE.md)
- Push to **`main`** → **production** deploy (your main URL / custom domain).
- Push to **`develop`** or any feature branch → an automatic **preview URL**
  (e.g. `develop.rusuh-booking.pages.dev`). This is your free dev environment — no extra setup.

---

## 8. Phase D — Buy a domain and connect it (~$10/yr, production only)

Skip this while testing — the `*.pages.dev` URL is fully functional. Do it for the public launch.

### D1. Register the domain
1. In the dashboard left sidebar, click **Domain Registration → Register Domains**.
2. Search for a name, e.g. `rusuhtiket.com` or `rusuhtiket.id`.
3. Add it to the cart and pay (~$10/yr for `.com`).
   Because it is registered **at Cloudflare**, DNS is connected automatically — no manual records.

### D2. Attach the domain to the Pages project
1. Go to **Workers & Pages** and click your **`rusuh-booking`** project.
2. Open the **Custom domains** tab.
3. Click **Set up a custom domain**.
4. Type your domain (e.g. `rusuhtiket.com`) → **Continue** → **Activate domain**.
5. Cloudflare creates the DNS record (a CNAME to your Pages site) and issues the HTTPS
   certificate automatically. Wait a few minutes for it to go active.
6. Visit **`https://rusuhtiket.com`** — the app should load with a padlock (secure).
7. Repeat steps 3–6 for **`www.rusuhtiket.com`** so both the apex and `www` work.

> If the domain was registered *elsewhere* (not Cloudflare), you must first add the domain as a
> zone in Cloudflare and point its nameservers to Cloudflare before step D2 works.

---

## 9. Phase E — Manual GitHub Actions deployment to development

The `rusuh-booking` Pages project was created by Direct Upload and has no Git connection. The
GitHub Actions workflow is the single deployment path; it keeps deployment manual and runs the
quality gates before uploading the static artifact.

### Configure GitHub

1. Open **Settings → Environments** in `tiket-sampai-nonton/rusuh-booking-mobile`.
2. Create an environment named `development`.
3. Add these **environment secrets**:

   | Secret | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages Edit permission for this account |
   | `SONAR_TOKEN` | SonarCloud analysis token |
   | `TELEGRAM_BOT_TOKEN` | Token created by BotFather |
   | `TELEGRAM_CHAT_ID` | Telegram group or chat ID where release notices should arrive |

4. Add these **environment variables**:

   | Variable | Development value |
   |---|---|
   | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
   | `CLOUDFLARE_PAGES_PROJECT` | `rusuh-booking` |
   | `EXPO_PUBLIC_API_BASE_URL` | Development API URL; a placeholder is safe while mocks are enabled |
   | `EXPO_PUBLIC_USE_MOCKS` | `true` |
   | `EXPO_PUBLIC_ENV` | `development` |
   | `EXPO_PUBLIC_SITE_URL` | `https://rusuh-booking.pages.dev` |
   | `SONAR_ORGANIZATION` | SonarCloud organization key |
   | `SONAR_PROJECT_KEY` | `ticket-sampai-nonton_rusuh-booking-mobile` |

`EXPO_PUBLIC_USE_MOCKS=true` is required for this QA deployment. It prevents the demo app from
calling a placeholder or production API.

### Run the workflow

1. Open a pull request into `develop`. `Deploy Web Development` runs typecheck, lint/format,
   Jest/RNTL, dependency audit, and the SonarCloud quality gate. PR runs do not deploy.
2. After the approved change is on `develop`, open the repository's **Actions** tab.
3. Select **Deploy Web Development → Run workflow** and choose branch `develop`.
4. The manual run rechecks the current `develop` head, builds Expo Web, creates the sitemap,
   verifies SEO metadata and the public/transactional gzip budgets, and deploys the checked
   `dist/` artifact to Cloudflare Pages.
5. The workflow sends a Telegram message with each job's result and a link to the run logs.

GitHub only exposes the **Run workflow** control when the workflow file is present on the
repository's default branch. This repository's default branch is `main`, so merging the workflow
to `develop` alone does not make the manual button available. Promote the workflow file to `main`
through the normal `develop` → `main` release process; the workflow still rejects a manual run
unless the operator selects `develop`. The `main` branch is not deployed by this development
workflow.

The deploy job stays blocked unless the artifact passes the SEO checks and the bundle limits in
PIPELINE.md §5.1: initial JavaScript must be at most 1 MB gzip per route. The workflow does not
publish mobile OTA updates or native builds.

---

## 10. Rollback

Cloudflare keeps every past deployment's artifact, so rollback is instant:

```
  Deploy #1 (kept) ─┐
  Deploy #2 (kept) ─┤
  Deploy #3 (LIVE) ─┘
        │ bad release?
        └─▶ Workers & Pages → project → Deployments →
            pick last good one → "Rollback to this deployment"
```

This matches PIPELINE.md §7.3 / §11 "Web rollback": redeploy/promote a previous successful
artifact, verify public routes, record the Git SHA and deployment ID.

---

## 11. End state

- **Hosting:** Cloudflare Pages free tier — unlimited bandwidth, edge CDN, survives the 300k spike.
- **Dev:** `*.pages.dev` preview URLs per branch, free.
- **Production:** custom domain over HTTPS, ~$10/yr domain cost only.
- **Artifact:** `dist/` is built fresh each deploy, stored + served by Cloudflare, never committed.
- **Rollback:** re-promote a previous successful Pages deployment from the dashboard.
