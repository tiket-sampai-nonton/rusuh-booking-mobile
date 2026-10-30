# SKILLS-MAP.md — Skills by Task

> GENESIS Phase 4 output. Maps discovered skills to the tasks that require them.
> Conforms to `SKILLS-PROTOCOL.md` (discovery order: local `skill_search` → registry `skill_discover` → fallback).

---

## Overview

- **Project:** Rusuh Booking Tiket (FE — Expo Universal)
- **Date:** 2026-10-29 · **Re-run:** 2026-10-30 (Phase 4 re-executed after the v2 architecture rewrite — added NativeWind styling + Clean-Arch/DI domains)
- **Skill Discovery Method:** tool-driven (`skill_search` on the installed set, `skill_discover` on the registry) + honest fallback where no skill exists
- **Rule:** skills are **reference patterns, adapted to project decisions** — they never override `08-RULES.md` / `GROOMING-DECISIONS.md` / `ARCHITECTURE.md`. The agent **never installs**; it presents candidates and the human installs (R073).

---

## Skills by Domain

### Performance / React Native (RBT-081, RBT-030, RBT-042)
- **react-native-best-practices** (local: `skillsh/callstackincubator-agent-skills-react-native-best-practices`)
  - Covers: FPS, TTI, bundle size, memory leaks, re-renders, animations, FlashList, Hermes.
  - Key patterns: list virtualization; minimize re-renders; animate transform/opacity not layout; bundle trimming.
  - Applies to: RBT-030 (lists), RBT-042 (poller hygiene), **RBT-081 (perf/bundle budgets)**.

### Visual design / Design system (RBT-003, DESIGN-SYSTEM.md)
- **frontend-design** (local: `skillsh/anthropics-skills-frontend-design`)
  - Covers: intentional visual design, typography, non-templated aesthetic direction.
  - Key patterns: token-driven surfaces; deliberate type scale; theme-variable colour (no fixed literals — matches our design-token rule).
  - Applies to: RBT-003 (design tokens + theme), the DESIGN-SYSTEM component set.
- **frontend-design-workflow** (local: `frontend-design-workflow`)
  - Covers: mockup-first FE workflow, build on the project design system, right evidence (screenshot vs video), new-user usability review.
  - Applies to: presentation-layer stories (E4 events, E6 checkout UI) — the `src/presentation` work.

### Styling / NativeWind (RBT-003) — v2 domain
- **expo-tailwind-setup** (local, installed 2026-10-30: `skillsh/expo-tailwind-setup`) — official Expo skill: "Set up Tailwind CSS v4 in Expo with react-native-css and NativeWind v5 for universal styling."
  - Applies to: RBT-003 (NativeWind wiring + `tailwind.config.js` token source from prototype V5).
  - **⚠️ Version caveat (project adaptation):** the skill targets **Tailwind v4 + NativeWind v5** (bleeding-edge). The RBT-001 skeleton is **Expo SDK 52 / RN 0.76**, where **NativeWind v4** is the proven-stable line. At RBT-003, PIN the NativeWind/Tailwind versions deliberately and verify against SDK 52 before adopting v5 — follow the skill's *setup pattern*, not necessarily its exact versions (skills are reference, never override ARCHITECTURE/stack decisions).

### Clean Architecture / DI (RBT-004) — v2 emphasis
- **software-architecture-analysis** (local: `skillsh/magnus919-agent-skills-software-architecture-analysis`)
  - Covers: layer boundaries, coupling lenses, ports/adapters, clean-room structure.
  - Key patterns: dependency rule inward; ports in `src/domain`; manual DI composition root; swappable `HttpClient` (axios/fetch).
  - Applies to: RBT-004 (DI container + ports), and the ESLint boundary enforcement (D1).

### E2E evidence / recording (RBT-083)
- **browser-recording** (local: `browser-recording`)
  - Covers: record a browser flow as video/GIF via the project's Playwright + ffmpeg.
  - Key patterns: capture multi-step motion a still can't prove (queue countdown, admission transition, payment handoff).
  - Applies to: RBT-083 (Playwright web QA — evidence capture for acceptance scenarios).

---

## Skills by Task (critical-path + risk stories)

| Task | Domain | Skill | Source | Key Patterns |
|------|--------|-------|--------|--------------|
| RBT-003 | design system | frontend-design | local | token surfaces, type scale, theme-var colour |
| RBT-003 | NativeWind styling | expo-tailwind-setup | local (installed) | NativeWind + tailwind.config from prototype V5 tokens (pin versions for SDK 52) |
| RBT-004 | Clean-Arch / DI | software-architecture-analysis | local | ports in domain, manual DI root, swappable HttpClient |
| RBT-030 | RN lists | react-native-best-practices | local | virtualization, fewer re-renders |
| RBT-042 | polling perf | react-native-best-practices | local | cancel on unmount/background, no storm |
| RBT-081 | perf/bundle | react-native-best-practices | local | bundle trim, transform-only animation, Web Vitals |
| RBT-083 | e2e evidence | browser-recording | local | record motion flows for acceptance evidence |

---

## Skill Evaluation

| Skill | Aligns with ARCHITECTURE.md? | Aligns with RULES.md? | Adaptation Needed? |
|-------|------------------------------|----------------------|--------------------|
| react-native-best-practices | Yes (perf is cross-cutting; no architecture conflict) | Yes | Apply within Clean-Arch layers; perf work lives in features/adapters, not domain |
| frontend-design | Yes (design tokens already mandated) | Yes | Use the repo's design-token set, not invented palettes (figma/token rule) |
| browser-recording | Yes (Playwright is the web QA tool, D6.5) | Yes | Local/manual only — never add to cloud CI gate |

---

## Conflicts

| Skill | Conflict | Resolution |
|-------|----------|------------|
| (none) | No installed skill recommends a stack choice that conflicts with D4 (Expo/RN/RN-Web/Zustand/TanStack Query). | — |

> Note: the `threejs-*` family and `computer-use` are installed but **out of domain** for this project; not mapped.

---

## Skills Not Found (honest fallbacks)

No installed skill covers these domains. Per SKILLS-PROTOCOL, fallback = registry check at task time, else official docs + training knowledge. **Do NOT fabricate a skill where none exists.**

| Domain | Queries Tried | Fallback Approach |
|--------|---------------|-------------------|
| Expo EAS build/submit/update | "expo eas github actions" | Official Expo EAS docs + PIPELINE.md; registry `skill_discover` at RBT-005b/084 |
| Playwright e2e (web) setup | "playwright e2e testing" | TESTING-STRATEGY §4 + official Playwright docs; browser-recording for evidence; registry check at RBT-083 |
| Maestro (native e2e) | "maestro native e2e" | Official Maestro docs; registry check at RBT-083 |
| OpenAPI → TS codegen | "openapi codegen typescript" | Standard `openapi-typescript`/generator + API-CONTRACT; registry check at RBT-010 |
| Web push / service worker | "web push service worker" | Official Push API/Service Worker docs; registry check at RBT-073 |
| Payment / Midtrans SNAP + WebView | "midtrans snap webview payment" | Prototype `payment.html`/`snap.html` + Midtrans SNAP docs (mock-first, D10.5); registry check at RBT-061/065 |
| Server-authoritative clock / idempotency | "server clock idempotency" | ARCHITECTURE §/D3.2-D3.3 — in-house domain logic, no external skill needed |

---

## Sub-Agent Skill Protocol

When workers are dispatched (Parallel-Batch), the brief includes the skills above with `loaded_for` + `key_patterns` so workers **do not re-search** the same domain (SKILLS-PROTOCOL: max 2 searches/topic/session, R075).

---

## Skill Loading Log

| Skill | Domain | Source | Loaded At | Applied To |
|-------|--------|--------|-----------|------------|
| react-native-best-practices | perf/RN | local | Phase 4 | RBT-030/042/081 |
| frontend-design | design | local | Phase 4 | RBT-003, DESIGN-SYSTEM |
| browser-recording | e2e evidence | local | Phase 4 | RBT-083 |

---

## Ready for Implementation?

- [x] All task domains have a skill OR a documented fallback
- [x] All conflicts resolved or documented (none found)
- [x] Skill patterns adapted to project conventions
- [x] No skill overrides project RULES.md / GROOMING-DECISIONS.md

**Status:** READY (v2 re-run 2026-10-30) — **all 5 mapped skills now installed** (react-native-best-practices, frontend-design, frontend-design-workflow, software-architecture-analysis, **expo-tailwind-setup**) + browser-recording for evidence. NativeWind skill targets Tailwind v4 / NativeWind v5 — pin versions for SDK 52 at RBT-003. 7 fallback domains documented (no fabricated skills); registry discovery otherwise deferred to task time per SKILLS-PROTOCOL.
