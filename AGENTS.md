# AGENTS.md — Project Manifest

> Generated from GENESIS grooming decisions (Phase 4). Repo-root manifest for agent runtimes.
> Paths point at the consolidated genesis doc set (`.genesis/docs/`).

---

## Project Identity

- **Name:** Rusuh Booking Tiket — Front-End (Expo Universal)
- **Stack:** Expo · React Native · React Native Web · TypeScript · NativeWind · Zustand · TanStack Query
- **State:** Pre-implementation (GENESIS complete through H3; Phase 4 in progress)
- **Scope:** **FRONT-END only** — Backend is a separate team; BE OpenAPI contracts are a consumed integration contract.
- **Issue prefix:** `RBT`
- **Tracking:** GitHub (+ project board)
- **Branch base:** `develop` → PR → `main`
- **CI:** GitHub Actions + SonarCloud + EAS

---

## Workflow

Follow: `.genesis/workflow/WORKFLOW.md`

- **Single-ticket mode** for most stories.
- **Parallel-batch mode** for disjoint feature areas (E3/E4/E5 after E2).
- **Spike mode** for research (e.g. confirming the O2 payment contract).

---

## Source of Truth

| Priority | Document | Path |
|----------|----------|------|
| 0 | Grooming decisions (gates all) | `.genesis/docs/03-GROOMING-DECISIONS.md` |
| 1 | Architecture | `.genesis/docs/ARCHITECTURE.md` |
| 2 | API contracts | `.genesis/docs/api-contract/` |
| 2b | FE-BE alignment (gap list) | `.genesis/docs/FE-BE-align-contract.md` |
| 3 | Flow diagrams | `.genesis/docs/FE-Flow-Diagrams.md` |
| 4 | Edge cases | `.genesis/docs/EDGE-CASES.md` |
| 5 | Security | `.genesis/docs/SECURITY.md` |
| 6 | Observability | `.genesis/docs/OBSERVABILITY.md` |
| 7 | Testing strategy | `.genesis/docs/TESTING-STRATEGY.md` |
| 8 | Design system | `.genesis/docs/DESIGN-SYSTEM.md` |
| 9 | CI/CD pipeline | `.genesis/docs/PIPELINE.md` |
| 10 | Task list (detail) | `.genesis/docs/05-TASK-LIST.md` |
| 10b | Task run order (run reference) | `.genesis/docs/06-TASK-ORDER.md` |
| 11 | Project rules | `.genesis/docs/08-RULES.md` |
| 12 | Skills map | `.genesis/docs/07-SKILLS-MAP.md` |
| — | Prototype (UX reference) | `.genesis/prototype/Final/` |

**If code contradicts these docs, the docs win. Escalate instead of inventing.**
Upstream order: GROOMING-DECISIONS → OpenAPI contracts → FE-BE-align → FE-Flow-Diagrams → prototype V5.

---

## Blockers — Check Before Starting

Cross-team dependencies (FE mocks behind the real port until delivered — never blocks FE build):

| ID | Status | Blocks |
|----|--------|--------|
| O1 | Open (requested) | FE-NEED endpoints (buyer-set, anonymous join, `remainingTickets`, `description` JSON, profile-complete flag) — mock adapter until delivered |
| O2 | Open (to discuss) | Midtrans `createAttempt` + page-token contract shapes — mock `PaymentRepository` until delivered (D10.5) |
| O4 | Open | `/browse` server filter/sort + event history endpoint — client-side until delivered |

---

## Commands

```bash
# Install dependencies
npm install

# Start development (web + native dev)
npx expo start

# Type check
npm run typecheck        # tsc --noEmit (strict)

# Lint
npm run lint             # ESLint + Prettier

# Test (targeted; host memory is often tight — avoid full suite blindly)
npm test -- <path>       # Jest + RNTL

# Build web (SEO/static export)
npx expo export --platform web

# Native build / OTA (EAS)
eas build --profile <development|production>
eas update --channel <development|production>
```

> **Note:** exact script names land with RBT-001/005. Prefer targeted test runs; serialize memory-heavy builds.

---

## Project-Specific Rules

Full set in `.genesis/docs/08-RULES.md`; these extend `.genesis/workflow/RULES.md`. Highlights:

### MUST
- **MUST** keep domain/application layers framework-free; access the backend only through ports.
- **MUST** compute timers from `serverNow()`; never trust the device clock or a gateway callback.
- **MUST** let a guest complete the whole flow — login is optional.
- **MUST** build payment as production code against `PaymentRepository`, with a mock adapter swappable at the composition root (D10.5).

### NEVER
- **NEVER** force login, hard-code a TTL/poll interval, or run >1 poller per session.
- **NEVER** collect a payment instrument on the FE (SNAP owns it); never log/store a raw NIK.
- **NEVER** put e2e/contract checks in the cloud CI gate; never ship a public route as `single`.

### ASK
- **ASK** before adding a dependency, deviating from the locked stack, or changing a BE-consumed contract assumption.

---

## Architecture

### Structure
```
apps/client/                 # One Expo app — Android, iOS, Web
  src/
    app/                     # Expo Router routes only (no logic)
    domain/                  # entities, rules, state machines, ports (framework-free)
    application/             # use cases + dto (framework-free)
    infrastructure/          # repo impls, HttpClient (axios/fetch), platform adapters, __fixtures__ (mock PaymentRepository)
    presentation/            # screens, components, hooks (TanStack seam), stores (Zustand), theme
    providers/               # composition root: container.ts (manual DI), query-client, providers.tsx
    shared/                  # utils, constants, test-fixtures
  tailwind.config.js         # single design-token source (NativeWind, from prototype V5)
```
> **v2 (2026-10-30):** single app, Clean-Architecture layers as folders — supersedes the former 8-package monorepo. Boundaries are ESLint-enforced in the commit guard. See `.genesis/docs/ARCHITECTURE.md` §11.6–11.9.

### Dependency Direction
```
app (routes) → presentation → application (use cases) → domain → Ports/Contracts
                                                          ↑ implemented by → infrastructure adapters → Backend/OS/Browser
```
**Rule:** source dependencies point inward; outer adapters are swappable (mock ↔ BE, axios ↔ fetch). TanStack Query lives only in presentation hooks.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Language | TypeScript |
| Framework | Expo (Router, config plugins, dev builds) |
| UI | React Native |
| Web | React Native Web |
| Styling | NativeWind (Tailwind for RN/RN-Web); single token source = `tailwind.config.js` from prototype V5 |
| Client state | Zustand |
| Server data | TanStack Query (confined to `presentation/hooks` — the swap seam) |
| HTTP client | `HttpClient` port → axios / fetch adapter (swapped at composition root) |
| Forms | React Hook Form + Zod |
| Animation | Reanimated |
| QR | react-native-svg |
| Notifications | expo-notifications (native) + web push (service worker) |
| Secure storage | expo-secure-store (native) / secure cookie (web) |
| Local persistence | AsyncStorage (SQLite out for v1) |
| Package manager | npm |

---

## Key Patterns

### Server-authoritative clock & timers
Capture offset from a server response; `remaining = max(0, expiresAt − serverNow())`. FE displays, BE enforces.

### Ports + swappable adapters (mock-first)
Every backend capability is a port. Ship a mock adapter now (payment, FE-NEED gaps); bind the real BE adapter at the composition root later — no UI/domain change.

### Idempotent resumable actions
One Idempotency-Key per action, persisted, reused across refresh/retry, cleared on terminal.

---

## Skills Required

From `.genesis/docs/07-SKILLS-MAP.md`:

| Domain | Skill | Source |
|--------|-------|--------|
| perf/RN | react-native-best-practices | local |
| design | frontend-design | local |
| e2e evidence | browser-recording | local |
| EAS / Playwright / Maestro / OpenAPI codegen / web push / Midtrans | (no local skill — documented fallback) | registry/docs at task time |

---

## Routes / Screens

```
/                         Home (public, SEO static)
/browse                   Browse + URL filters (public, SEO static)
/events/[eventId]         Event detail (public, SEO static)
/waiting/[eventId]        Waiting room (noindex)
/checkout/[sessionId]     Checkout / hold (noindex)
/payment/[bookingId]      Payment page → SNAP handoff (noindex)
/success/[bookingId]      Success + e-ticket QR (noindex)
/expired/[resourceId]     Expired / failed (noindex)
```

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend base URL | yes |
| `EXPO_PUBLIC_USE_MOCKS` | Bind mock adapters vs real BE (payment + FE-NEED) | yes (dev) |
| `EXPO_PUBLIC_ENV` | `development` / `production` | yes |

**Never commit actual values. Use `.env.example` for templates; no secrets in `EXPO_PUBLIC_*`.**

---

## Escalation

| Unclear about... | Escalate to |
|------------------|-------------|
| Scope / priority | Product owner |
| API contract / FE-NEED gaps | BE team lead |
| Architecture | FE tech lead |
| Security / PII (NIK) | Security/legal + FE tech lead |
| Payment contract (Midtrans) | BE team + FE tech lead |
