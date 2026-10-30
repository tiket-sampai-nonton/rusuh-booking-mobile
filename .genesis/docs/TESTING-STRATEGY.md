# TESTING-STRATEGY.md — Rusuh Booking Tiket (FE)

> GENESIS Phase 2 output. Consolidates `ARCHITECTURE.md §9` + `PIPELINE.md §4` + `GROOMING-DECISIONS.md §D6`.
> Principle: the shared domain/application core is heavily unit-tested (it holds the real logic);
> platform/UI is behavior-tested; E2E runs local/manual, not in cloud CI.

## 1. Test pyramid & ownership

| Layer | Tool | Runs in cloud CI? | Covers |
|---|---|---|---|
| Domain rules | **Jest** | ✅ yes | NIK validation, quantity/3-cap rules, money (`minorToIDR`), timer math (`ServerClock`), queue/booking/payment state machines, error mapping |
| Application / use cases | **Jest** | ✅ yes | JoinQueue, HoldBooking, CreatePaymentAttempt, RestoreSession, idempotency reuse |
| API adapters | **Jest + MSW / contract fixtures** | ✅ yes | `{meta,data}`/`ErrorEnvelope` unwrap, error codes, retries, `Retry-After`, server-clock sync, idempotency header |
| Components | **React Native Testing Library** | ✅ yes | accessible labels, loading/empty/error/expired states, behavior (not snapshots) |
| Native adapters | **Jest unit + local/manual Maestro** | unit ✅ / Maestro ❌ | secure storage, notifications, deep links, file share |
| Web | **Playwright (local/manual)** | ❌ no | responsive, keyboard/focus, URL routes, SEO output, download/print, reduced-motion |
| Native E2E | **Maestro (local/manual)** | ❌ no | final dev/preview builds, permissions, deep links, push, share |
| End-to-end flow | Test BE environment | ❌ no (manual) | queue → booking → payment → success/expiry |

**Static quality:** SonarCloud runs in cloud CI (after typecheck/lint/unit/audit) as a gate — it is **not** an E2E runner (D6.5).

## 2. Coverage targets (D6.3)

- **≥90% coverage on shared domain/application** (`src/domain`, `src/application`, use cases + state machines) — enforced by the SonarCloud new-code gate via Jest `lcov`.
- UI/platform layers: behavior-covered, not held to 90% (logic lives in the shared core by design).
- Acceptable non-covered: generated OpenAPI types, pure asset/token modules, `.web.tsx`/`.native.tsx` thin presentation shells with no logic.

## 3. What to test where (logic-in-the-core rule)

Because logic never splits across platforms (D2.3), the hard assertions live in Jest on the shared core, not in UI tests:

- **NIK rules:** 16-digit format; mandatory (no NIK-less path, D9.1); buyer-NIK single-use across attendee rows; attendee-check result handling (`ALREADY_REGISTERED` blocks, `CHECK_LIMIT_REACHED` does not).
- **Quantity:** max 3 combined; reject over-stock / over-3 / accumulation-over-3.
- **Timers:** `remaining = max(0, expiresAt − serverNow())`; device-clock change and refresh do not extend or reset; TTLs read from server config, never hard-coded (D9.2).
- **Idempotency:** one key per action reused across retry/refresh; cleared on terminal (D3.3).
- **State machines:** only `ADMITTED` authorizes; booking/payment transitions match the contract enums; payment poll to terminal.
- **Error mapping:** every `errorCode` → a Bahasa message + the right UI reaction (EDGE-CASES.md).

## 4. Minimum acceptance scenarios (from ARCHITECTURE §9)

1. Refresh while waiting preserves then revalidates queue state.
2. Two taps on hold use one idempotency key.
3. Device clock change does not extend a booking.
4. Stock / max-per-NIK errors render as recoverable UI states.
5. Payment redirect/deep-link resumes the correct attempt.
6. Expired booking clears the local hold and cannot be paid.
7. QR ticket renders and downloads/shares on each target.
8. Reduced motion keeps timers and functional state updating.

**Added for H1 decisions:**
9. NIK consent gate blocks collection until accepted (D7.1).
10. No full NIK in logs/storage/QR (security assertion, SECURITY.md §8).
11. Payment: FE renders success only after BE `status=PAID`, never on callback alone (D10).
12. Native **and** web push registration paths both exercised (D8.2).
13. Re-join same event restores the existing queue entry (no duplicate) (D9.3).

## 5. Flash-crowd / capacity testing (NFR-03, ARCHITECTURE §9.2)

FE load-test baseline (BE confirms final capacity): **50,000** public browsers / **10,000** waiting-room / **1,000** checkout concurrent. Measure CDN hit rate, JS transfer, memory, event-list render, **queue poll volume** (prove one adaptive poller/session), reconnect, and recovery after network interruption. FE must back off on `Retry-After` and never locally reconcile inventory. Tooling: load harness against a test BE (local/manual, not cloud CI).

## 6. Accessibility testing (WCAG 2.1 AA, web)

Automated axe-style checks + manual: keyboard-only flow, screen-reader smoke, focus-order, reduced-motion, contrast, form-error announcement, and manual verification of queue/payment status changes (live regions).

## 7. CI gate summary (PIPELINE.md §12)

| Gate | Blocks merge? |
|---|---|
| TS typecheck (strict) | ✅ |
| ESLint + Prettier | ✅ |
| Jest + RNTL | ✅ |
| npm audit (high/critical prod) + secret scan | ✅ |
| SonarCloud quality gate (+≥90% shared coverage) | ✅ |
| Web SEO-output + bundle budget | ✅ (web release) |
| Contract validation | ❌ (local/separate) |
| Playwright / Maestro E2E | ❌ (local/manual) |

## 8. Test data

- Contract-shaped fixtures in `src/shared/test-fixtures` (with mock adapters in `src/infrastructure/__fixtures__`; mirrors prototype V5 mock scenarios: ≥5 events incl. SOLD_OUT / NOT_STARTED / CLOSED).
- **Never** use real NIK in fixtures — use valid-format synthetic 16-digit values.
- OTP demo code `123456` for the mock/dev auth path.
