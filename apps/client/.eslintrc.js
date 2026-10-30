// Legacy ESLint config (eslint-config-expo 8.x is eslintrc-format; run with
// ESLINT_USE_FLAT_CONFIG=false on ESLint 8).
//
// RBT-001 authors the Clean-Architecture layer-boundary rules (inward-only
// dependency direction). RBT-005a wires `eslint` into the husky pre-commit guard.
//
// Dependency direction (ARCHITECTURE §2.1, §3):
//   app → presentation → application → domain ← (implemented by) infrastructure
//   - domain:          pure TS, imports NO other src layer
//   - application:     may import domain only
//   - presentation:    may import application + domain, NEVER infrastructure
//   - infrastructure:  implements domain ports; may import domain
//   - providers:       composition root — the ONLY place adapters bind
module.exports = {
  root: true,
  extends: ["expo"],
  ignorePatterns: ["dist/", ".expo/", "coverage/", "node_modules/"],
  overrides: [
    {
      files: ["src/**/*.{ts,tsx}"],
      rules: {
        "import/no-restricted-paths": [
          "error",
          {
            zones: [
              // domain is pure — it may not reach any other layer
              { target: "./src/domain", from: "./src/application" },
              { target: "./src/domain", from: "./src/infrastructure" },
              { target: "./src/domain", from: "./src/presentation" },
              { target: "./src/domain", from: "./src/providers" },
              { target: "./src/domain", from: "./src/app" },
              // application may import domain only
              { target: "./src/application", from: "./src/infrastructure" },
              { target: "./src/application", from: "./src/presentation" },
              { target: "./src/application", from: "./src/providers" },
              { target: "./src/application", from: "./src/app" },
              // presentation must reach the backend through a use case → port,
              // never infrastructure directly
              { target: "./src/presentation", from: "./src/infrastructure" },
              // infrastructure implements domain ports; it must not depend on
              // presentation or the composition root
              { target: "./src/infrastructure", from: "./src/presentation" },
              { target: "./src/infrastructure", from: "./src/providers" },
              { target: "./src/infrastructure", from: "./src/app" },
            ],
          },
        ],
      },
    },
  ],
};
