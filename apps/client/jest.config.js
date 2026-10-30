/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop))",
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/jest.css-stub.js",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
    "^@providers/(.*)$": "<rootDir>/src/providers/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    // Domain PORTS are pure TypeScript interfaces/types (DIP). They compile to
    // ZERO executable JS, so coverage reports them as 0/0 → 0%. They are
    // non-executable declarations (like .d.ts) and are verified by the compiler
    // + exercised structurally through their adapters' tests. Documented
    // exclusion per the project's "whole-src, documented non-executable only"
    // coverage rule. Concrete adapters (infrastructure/**) are NOT excluded.
    "!src/domain/repositories/*.repository.ts",
    "!src/domain/services/*.port.ts",
    // HttpClient transport PORT — also a pure interface (zero executable JS).
    "!src/infrastructure/http/http-client.ts",
    // Idempotency store PORT — pure interface (zero executable JS), RBT-012.
    "!src/domain/idempotency/*.port.ts",
  ],
};
