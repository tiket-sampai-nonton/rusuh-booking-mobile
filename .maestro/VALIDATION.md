# Validation record

## 2026-11-11: after rebase onto origin/develop

- Branch: maestro/dev; base: 620a5ca (PR #176 / RBT-130). Fetch, rebase, and restoration of local Maestro changes completed without conflicts.
- Installed locked dependencies, regenerated Android with Expo prebuild, rebuilt x86_64 debug APK, and installed it on Android_12_Tiramisu_API_33 / emulator-5554.
- Executed through Maestro MCP in mock mode, including all 31 default flows and all three queue scenario configurations. Restored the default mock queue configuration afterward.
- Latest results after retries: **21 passed, 13 failed, 34 flows total**.
- All 44 YAML files passed Maestro syntax validation after test adjustments.
- Test adjustments: 60-second initial Home wait for cold bundling, native filter entry via Browse, and scrolling to the consent error before asserting it.

### Failures

Eleven payment-dependent flows did not reach payment-timer after checkout submission. This run does not establish the root cause or validate later SNAP/ticket behavior. The filter flow could not see browse-reset after applying its filter. The consent flow could not find checkout-consent-error after submission, including after scrolling.

### Per-flow results

| Flow                                                                                   | Result | Observed failure                                     |
| -------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| [flows/01-discovery.yaml](flows/01-discovery.yaml)                                     | PASS   |                                                      |
| [flows/02-filter.yaml](flows/02-filter.yaml)                                           | FAIL   | Assertion is false: id: browse-reset is visible      |
| [flows/03-auth-validation.yaml](flows/03-auth-validation.yaml)                         | PASS   |                                                      |
| [flows/04-registration-profile-logout.yaml](flows/04-registration-profile-logout.yaml) | PASS   |                                                      |
| [flows/05-queue-checkout.yaml](flows/05-queue-checkout.yaml)                           | PASS   |                                                      |
| [flows/06-queue-leave.yaml](flows/06-queue-leave.yaml)                                 | PASS   |                                                      |
| [flows/07-checkout-validation.yaml](flows/07-checkout-validation.yaml)                 | PASS   |                                                      |
| [flows/08-checkout-leave.yaml](flows/08-checkout-leave.yaml)                           | PASS   |                                                      |
| [flows/09-ticket-cap.yaml](flows/09-ticket-cap.yaml)                                   | PASS   |                                                      |
| [flows/10-guest-payment-success.yaml](flows/10-guest-payment-success.yaml)             | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/11-payment-failure-retry.yaml](flows/11-payment-failure-retry.yaml)             | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/12-payment-unknown.yaml](flows/12-payment-unknown.yaml)                         | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/13-ticket-download.yaml](flows/13-ticket-download.yaml)                         | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/14-method-gopay.yaml](flows/14-method-gopay.yaml)                               | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/14-method-qris.yaml](flows/14-method-qris.yaml)                                 | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/14-method-va_bni.yaml](flows/14-method-va_bni.yaml)                             | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/14-method-va_bri.yaml](flows/14-method-va_bri.yaml)                             | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/14-method-va_permata.yaml](flows/14-method-va_permata.yaml)                     | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/15-recovery-hold.yaml](flows/15-recovery-hold.yaml)                             | PASS   |                                                      |
| [flows/15-recovery-payment.yaml](flows/15-recovery-payment.yaml)                       | PASS   |                                                      |
| [flows/15-recovery-queue.yaml](flows/15-recovery-queue.yaml)                           | PASS   |                                                      |
| [flows/15-recovery-turn.yaml](flows/15-recovery-turn.yaml)                             | PASS   |                                                      |
| [flows/16-checkout-expiry.yaml](flows/16-checkout-expiry.yaml)                         | PASS   |                                                      |
| [flows/17-payment-expiry.yaml](flows/17-payment-expiry.yaml)                           | FAIL   | Assertion is false: id: payment-timer is visible     |
| [flows/18-attendee-registered.yaml](flows/18-attendee-registered.yaml)                 | PASS   |                                                      |
| [flows/19-attendee-check-limit.yaml](flows/19-attendee-check-limit.yaml)               | PASS   |                                                      |
| [flows/20-profile-guest-tickets.yaml](flows/20-profile-guest-tickets.yaml)             | PASS   |                                                      |
| [flows/21-success-without-payment.yaml](flows/21-success-without-payment.yaml)         | PASS   |                                                      |
| [flows/22-returning-login.yaml](flows/22-returning-login.yaml)                         | PASS   |                                                      |
| [flows/23-consent-required.yaml](flows/23-consent-required.yaml)                       | FAIL   | No visible element found: id: checkout-consent-error |
| [flows/24-payment-leave.yaml](flows/24-payment-leave.yaml)                             | FAIL   | Assertion is false: id: payment-timer is visible     |
| [scenarios/queue-admitted.yaml](scenarios/queue-admitted.yaml)                         | PASS   |                                                      |
| [scenarios/queue-sold-out.yaml](scenarios/queue-sold-out.yaml)                         | PASS   |                                                      |
| [scenarios/queue-turn-missed.yaml](scenarios/queue-turn-missed.yaml)                   | PASS   |                                                      |

Machine-readable latest results: [rebase-final-results.json](artifacts/rebase-final-results.json). Per-flow logs are in artifacts/ (local and gitignored). Initial failures remain in rebase-results.json; setup retries and scenario runs are in rebase-supplemental.json.

## Earlier validation (before this rebase)

Branch: maestro/dev. Android: Android_12_Tiramisu_API_33 (emulator-5554), installed com.tiketsampainonton.rusuhbooking debug build with local Metro. The emulator was started for this task. Device operations used the installed Maestro MCP server over STDIO through tools/mcp.cjs.

- Maestro syntax: 44 YAML files passed using tools/check-syntax.cjs (all flows, helpers, scenario flows).
- TypeScript: npm run typecheck passed.
- Targeted Jest: mock-queue-scenarios.test.ts and providers/container.test.ts passed, 25 tests total.
- Targeted ESLint: modified TypeScript files passed.
- Full guest booking/payment flow: failed waiting for payment-timer after checkout-submit. The earlier field-value and checked-state assertions passed. Failure inspection showed checkout still active with 03:24 remaining, buyer identity switch checked, consent checked, and no payment navigation. The suite retains this failing assertion; payment completion is not established.
- MCP Android: 03-auth-validation passed (12 commands reported).
- MCP Android: 05-queue-checkout passed (6 commands reported, with nested helpers covering admission and form navigation).
- MCP Android: 01-discovery passed on rerun (8 commands reported), covering Home, Browse, History and event detail. The initial native bottom-navigation selector was corrected to bottom-nav-browse.
- Remaining native flows have syntax validation only.

## Known limits

Queue scenario files require separate mock bundle configurations. Slow expiry flows and the platform share sheet have not been certified. Real backend OTP, SNAP/WebView, push delivery, and process-death restoration require a test backend/platform fixture. The mock queue and booking state live in memory. All recovery deep links in flows/15-\* exercise recovery screens, not server transitions.
