# `presentation/` — screens, components, hooks, stores, theme

May import `application` + `domain`. NEVER `infrastructure` directly — reach the backend through a use case → port. TanStack Query lives only in `hooks/` (the swap seam).

Subfolders: `screens/`, `components/`, `hooks/`, `stores/` (Zustand), `theme/`. See `.genesis/docs/ARCHITECTURE.md` §3.
