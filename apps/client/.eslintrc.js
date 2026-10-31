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
  // Teach eslint-plugin-import how to resolve the TypeScript path aliases
  // (@domain/*, @presentation/*, … from tsconfig.json "paths") and RN's
  // platform-specific extensions. Without this, `import/no-unresolved` fires on
  // every aliased import in editors (the resolver falls back to plain node and
  // cannot see the tsconfig paths). `eslint-import-resolver-typescript` reads
  // the tsconfig directly, so the aliases resolve exactly as tsc + Metro see them.
  settings: {
    "import/resolver": {
      typescript: {
        project: __dirname + "/tsconfig.json",
        alwaysTryTypes: true,
      },
      node: {
        extensions: [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          ".native.ts",
          ".native.tsx",
          ".ios.ts",
          ".ios.tsx",
          ".android.ts",
          ".android.tsx",
        ],
      },
    },
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
  },
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
    // RBT-004 AC2 (D1 mitigation, ARCHITECTURE §2.1 / §11.6): domain and
    // application are framework-free. Ban React / React Native / Expo / native
    // / browser packages there so the dependency rule is lint-enforced, not just
    // convention. `import/no-restricted-paths` above blocks cross-LAYER imports;
    // this blocks framework imports the path zones cannot see.
    {
      files: ["src/domain/**/*.{ts,tsx}", "src/application/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              { name: "react", message: "domain/application must be framework-free (RBT-004 AC2)." },
              { name: "react-dom", message: "domain/application must be framework-free (RBT-004 AC2)." },
              { name: "react-native", message: "domain/application must be framework-free (RBT-004 AC2)." },
              { name: "react-native-web", message: "domain/application must be framework-free (RBT-004 AC2)." },
            ],
            patterns: [
              {
                group: [
                  "expo",
                  "expo-*",
                  "expo/*",
                  "@expo/*",
                  "react-native/*",
                  "react-native-*",
                  "@react-native/*",
                  "@react-navigation/*",
                  "nativewind",
                  "nativewind/*",
                ],
                message:
                  "domain/application must not import React Native / Expo / native / browser packages (RBT-004 AC2).",
              },
            ],
          },
        ],
      },
    },
    // RBT-004 AC2 (D1): any `eslint-disable` of a boundary/framework rule MUST
    // carry a justification comment — no silent bypass (ARCHITECTURE §11.6).
    // The dedicated `eslint-comments/require-description` rule needs
    // `eslint-plugin-eslint-comments`, which is NOT a dependency of this app and
    // RBT-004 must add no dependencies. Deferred to RBT-005b (CI), which owns the
    // lint toolchain; the justification-comment convention is enforced in review
    // meanwhile (every disable in this codebase carries a `-- reason`). The
    // framework-import ban above is the load-bearing half of AC2 and is active.
  ],
};
