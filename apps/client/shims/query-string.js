/**
 * query-string CJS interop shim (RBT-020 fix).
 *
 * ROOT CAUSE: `query-string@9` is pure ESM (`"type":"module"`, no CommonJS
 * entry). `expo-router@4`'s path<->state forks do
 * `const queryString = __importStar(require("query-string"))` and then call
 * `queryString.stringify(...)` / `.parse(...)` expecting the FLAT v6/v7 CJS API.
 * Under Metro's CJS interop the v9 package resolves to `{ __esModule, default }`
 * where the functions live on `.default`, so `queryString.stringify` is
 * `undefined` → the app throws `queryString.stringify is not a function` the
 * moment expo-router builds a URL (e.g. after a verify triggers router state).
 *
 * FIX: `apps/client/package.json` pins `query-string@^9.5.1` deliberately for
 * Hermes native-boot compatibility, so we keep v9 and instead re-expose its
 * named exports on a FLAT CommonJS object. Metro aliases the `query-string`
 * specifier to this file (see `metro.config.js`), so every consumer — expo-router
 * on web AND native — gets a module whose `stringify`/`parse`/etc. are callable
 * at the top level. The real v9 implementation still runs; only the shape is
 * bridged.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- deliberate CJS->ESM interop bridge
const qs = require("query-string/base.js");

// `query-string/base.js` is the ESM module; under Metro/Babel esModule interop
// its named exports appear either flat or under `.default`. Normalize both.
const flat = qs && qs.__esModule && qs.default ? qs.default : qs;

module.exports = {
  stringify: flat.stringify,
  parse: flat.parse,
  parseUrl: flat.parseUrl,
  stringifyUrl: flat.stringifyUrl,
  extract: flat.extract,
  pick: flat.pick,
  exclude: flat.exclude,
};
