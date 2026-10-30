# `infrastructure/` — adapters implementing domain ports

The only layer that touches axios/fetch, Expo/native SDKs, and storage. Implements `domain` ports; must not import `presentation`, `providers`, or `app`.

Subfolders: `http/`, `api/`, `notifications/`, `storage/`, `__fixtures__/` (mock adapters). See `.genesis/docs/ARCHITECTURE.md` §3.
