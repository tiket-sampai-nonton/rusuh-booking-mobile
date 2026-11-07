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

### Recommended flow — GitHub Actions builds; Cloudflare Pages stores and serves

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
                             │ merge to develop or main starts one Release Pipeline
                             ▼
          ┌──────────────────────────────────────┐
          │          GITHUB ACTIONS               │
          │  1. GATE   typecheck, lint, tests,     │
          │            dependency audit           │
          │  2. BUILD  Expo Web → dist/            │
          │  3. DEPLOY Wrangler uploads artifact   │
          └──────────────────┬────────────────────┘
                             │ preprod or production project
                             ▼
          ┌──────────────────────────────────────┐
          │          CLOUDFLARE PAGES             │
          │  1. STORE   keeps a versioned deploy  │
          │  2. SERVE   global edge CDN + HTTPS   │
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
  GitHub runner      built fresh here   produced during each build
  Cloudflare CDN     YES (final)        what users actually download
  ──────────────────────────────────────────────────────────────
```

Mental model: `source code ──GitHub Actions build──▶ dist/ ──Wrangler deploy──▶ Pages CDN ──▶ users`.
You do not commit `dist/`; the runner builds it and uploads the checked artifact to Pages.
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
| Preprod / development | `develop` | `rusuh-booking.pages.dev` (current project) | $0 |
| Production | `main` | Separate Pages project; custom domain when ready | Domain ~ $10/yr |

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

## 7. Phase C — Create Cloudflare Pages projects for GitHub Actions

GitHub Actions owns the build and upload. Cloudflare Pages should use **Direct Upload**, not Git
integration: the runner checks the code, builds `apps/client/dist`, and deploys that artifact with
Wrangler. The preprod project `rusuh-booking` already exists. Production requires a second Pages
project and is not configured yet.

### C1. Create a Pages project (skip for existing `rusuh-booking`)
1. In Cloudflare, open **Workers & Pages → Create application → Pages**.
2. Choose **Direct Upload** (sometimes labeled **Upload your static files**).
3. Name the preprod project `rusuh-booking`, then create it.
4. For the initial project creation only, upload a local web export if Cloudflare asks for assets.
   Later releases are built and uploaded by GitHub Actions; do not connect the repo to Cloudflare.

### C2. Keep build configuration in GitHub Actions

Do not configure a Cloudflare build command or root directory. The GitHub runner builds from the
monorepo app folder (`apps/client`) and Wrangler deploys the generated `dist/` directory. Set
environment-specific `EXPO_PUBLIC_*` variables in the matching GitHub Environment because those
values are embedded during the runner's build; never store secrets in `EXPO_PUBLIC_*` variables.

### C3. Confirm the first deployment
1. Open **Workers & Pages → `rusuh-booking` → Deployments**.
2. After GitHub Actions deploys to the `develop` branch, open `https://rusuh-booking.pages.dev`.
3. Confirm the home and public routes load, then check the GitHub Actions run and Telegram summary.

### C4. Branch → environment mapping (matches PIPELINE.md)
- Merge/push to **`develop`** → automatic preprod web build and deployment to the `rusuh-booking`
  Pages project, after shared quality and SEO/bundle gates pass.
- Merge/push to **`main`** → automatic production web build and deployment to a separate Pages
  project, after the same gates pass. Production project creation and configuration are pending.
- Pull requests run validation only. Feature branches do not deploy to either user-facing project.

---

## 8. Phase D — Buy a domain and connect it (~$10/yr, production only)

Skip this while testing — the `*.pages.dev` URL is fully functional. Do it for the public launch.

### D1. Register the domain
1. In the dashboard left sidebar, click **Domain Registration → Register Domains**.
2. Search for a name, e.g. `rusuhtiket.com` or `rusuhtiket.id`.
3. Add it to the cart and pay (~$10/yr for `.com`).
   Because it is registered **at Cloudflare**, DNS is connected automatically — no manual records.

### D2. Attach the domain to the production Pages project
1. Go to **Workers & Pages** and click the separate **production** Pages project (not the preprod
   `rusuh-booking` project).
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

## 9. Phase E — Configure the single GitHub Actions Release Pipeline

The Pages projects are Direct Upload projects with no Git connection. One top-level GitHub Actions
Release Pipeline should handle PR checks, automatic web + compatible EAS OTA releases after merges,
and an optional manual Firebase APK mode. It may call reusable workflows for each concern, but those
files should not create separate user-triggered pipelines.

### Configure GitHub Environments

1. Open **Settings → Environments** in `tiket-sampai-nonton/rusuh-booking-mobile`.
2. Create or confirm the `development` environment and add:

   | Type | Name | Development value |
   |---|---|---|
   | Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages Edit permission |
   | Secret | `TELEGRAM_BOT_TOKEN` | Token created by BotFather |
   | Secret | `TELEGRAM_CHAT_ID` | Telegram group or chat ID for release notices |
   | Variable | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
   | Variable | `CLOUDFLARE_PAGES_PROJECT` | `rusuh-booking` |
   | Variable | `EXPO_PUBLIC_API_BASE_URL` | Development API URL or safe placeholder while mocks are enabled |
   | Variable | `EXPO_PUBLIC_USE_MOCKS` | `true` |
   | Variable | `EXPO_PUBLIC_ENV` | `development` |
   | Variable | `EXPO_PUBLIC_SITE_URL` | `https://rusuh-booking.pages.dev` |

3. Create a separate protected `production` environment when the production Pages project is ready.
   Add its own Cloudflare project name, live API URL, `EXPO_PUBLIC_ENV=production`,
   `EXPO_PUBLIC_USE_MOCKS=false`, production site URL, and release notification credentials. Keep
   production secrets, Android signing credentials, and Firebase settings separate from development.
4. Create or select the Expo project in the account that owns the app, then record its project ID;
   this is an identifier, not a secret. The Expo project slug may differ from the app's slug because
   the project ID is the EAS link. The current Expo project is `@chelseacry/rusuh-booking`; the app
   config uses owner `chelseacry` and slug `rusuh-booking-mobile`. The dynamic app config uses
   `EXPO_PROJECT_ID` to set `updates.url` and `extra.eas.projectId`, and uses `EAS_CHANNEL` to embed
   the matching `development` or `production` channel in native builds. Create either missing EAS
   channel with `npx eas-cli@27.5.0 channel:create development --non-interactive` and
   `npx eas-cli@27.5.0 channel:create production --non-interactive`.
5. In the GitHub `development` environment, add secret `EXPO_TOKEN` and variable `EXPO_PROJECT_ID`.
   Add the same values in a protected GitHub `production` environment before enabling production
   OTA. Use an Expo access token intended for CI rather than an Expo account password.
6. In the Expo project's **Environment variables** settings, configure the matching public app
   values separately for `development` and `production`: `EXPO_PUBLIC_API_BASE_URL`,
   `EXPO_PUBLIC_ENV`, `EXPO_PUBLIC_USE_MOCKS`, and `EXPO_PUBLIC_SITE_URL`. The release workflow
   calls `eas update --environment ...`, so these values must exist in Expo as well as GitHub.
7. Because `expo-updates` and its channel/project settings are native build configuration, existing
   installed APKs/iOS builds will not receive OTA. After adding the Expo project ID, use the manual
   Firebase distribution path to build and install a fresh development APK. Its channel is set by
   the orchestrator to `development`; the future production binary must be built with `production`.
   Verify a harmless JavaScript-only update on a QA device before enabling automatic publishing.
8. Keep repository variable `EAS_OTA_DEVELOPMENT_ENABLED` unset/false until development Expo,
   GitHub, and QA binary setup is verified. Then set it to `true` to enable compatible OTA
   publication on `develop` merges. Set `EAS_OTA_PRODUCTION_ENABLED=true` separately only after
   production Expo and release settings are ready; enabling development OTA does not enable `main`.

Never place real secrets in `EXPO_PUBLIC_*` variables; those values are embedded in browser/mobile
bundles. SonarCloud is temporarily skipped by project decision and is not a deployment secret
requirement until the scan is restored.

### Expected trigger behavior

- A pull request into `develop` or `main` runs the shared quality gates and does not deploy.
- A successful merge to `develop` starts one orchestrator run that deploys to the preprod Pages
  project and publishes an EAS development OTA only when the change is OTA-compatible.
- A successful merge to `main` starts the same orchestrator and deploys to a separate production
  Pages project, then publishes an EAS production OTA only when compatible.
- Firebase APK distribution is an optional manual mode on that same orchestrator. Select `develop`
  for the mock/preprod APK or `main` for the live production APK. Native-affecting changes require
  this new APK path; OTA must be skipped for those changes. The artifact names are
  `rusuh-booking.preprod.apk` for `develop` and `rusuh-booking.apk` for `main`.
- The Telegram summary runs for success or failure and identifies failed jobs.

**Current setup is partially live:** the Release Pipeline is on the default `main` branch, and a
successful merge to `develop` starts the preprod web deployment. EAS OTA remains disabled until the
Expo project, credentials, channel settings, EAS environment variables, and a new OTA-capable native
build are ready. The production Cloudflare Pages environment is not configured yet, so production
web and OTA delivery are not ready.

The orchestrator is on the default branch, so GitHub exposes **Run workflow** for manual Firebase
distribution. Open **Actions → Release Pipeline → Run workflow**, select `develop` for the QA APK or
`main` for production, and optionally enter release notes. A manual run executes quality gates and
Firebase distribution; web deployment and OTA publication run only after a successful branch push.

The web job stays blocked unless the artifact passes SEO checks and the PIPELINE.md §5.1 budget:
initial JavaScript must be at most 1 MB gzip per route. Cloudflare Pages receives the checked
`dist/` artifact; it does not build the app itself.

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
- **Preprod:** `rusuh-booking.pages.dev`, deployed from `develop` by the Release Pipeline.
- **Production:** separate Pages project deployed from `main`; custom domain over HTTPS when configured.
- **Artifact:** `dist/` is built fresh each deploy, stored + served by Cloudflare, never committed.
- **Rollback:** re-promote a previous successful Pages deployment from the dashboard.
