# `providers/` — COMPOSITION ROOT

The ONLY place concrete adapters bind to domain ports (mock ↔ BE, axios ↔ fetch). Reads `EXPO_PUBLIC_USE_MOCKS`.

Files (wired in RBT-004): `container.ts` (manual DI), `service-context.tsx`, `query-client.ts`, `providers.tsx`. See `.genesis/docs/ARCHITECTURE.md` §3.
