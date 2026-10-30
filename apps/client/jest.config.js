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
  ],
};
