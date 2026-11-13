# RBT-140 Guest Journey Recovery and Event Filter Regression Prompt

> This document is a reusable execution prompt and sequential regression plan. It is not test evidence and does not claim that every scenario has passed.

## Context

RBT-140 was recorded as merged to `develop` on 2026-11-13. Existing implementation notes and evidence are under `.genesis/evidence/RBT-140/`; review those first and distinguish prior results from any new run. The recorded run did not complete every payment/SNAP, physical-device, offline, and reconnect scenario end to end.

When using this prompt, inspect the actual branch and worktree first. Preserve existing edits, generated evidence, and the user’s current task. Do not reset, stash, discard, overwrite, commit, push, open a PR, merge, or close issues unless separately authorized. Do not create a new branch unless the user requests it.

## Copy-ready execution prompt

Continue work in the Rusuh Booking Tiket FE repository. Make guest Checkout, Payment, SNAP, cancellation, timeout, journey restoration, and Home/Browse event filtering reliable on Android, iOS, and web. Use the BE repository as a read-only contract and implementation reference. First determine whether each observed issue is in FE behavior, BE behavior/contract, payment provider behavior, or the test environment. Fix only confirmed FE defects within the approved scope, then retest affected journeys. Do not claim a pass without running the scenario and capturing sanitized evidence.

### 1. Preflight and source-of-truth review

1. Read the repository `AGENTS.md`, `.genesis/workflow/WORKFLOW.md`, `.genesis/docs/08-RULES.md`, `.genesis/docs/ARCHITECTURE.md`, `.genesis/docs/SECURITY.md`, `.genesis/docs/EDGE-CASES.md`, the RBT-140 entry in `.genesis/docs/05-TASK-LIST.md`, and relevant API contracts/FE-BE alignment documents.
2. Read relevant existing recovery evidence in `.genesis/evidence/RBT-140/`, including the current as-built summary, platform recovery notes, filter evidence, and known payment/cancellation analysis. Record which cases are already covered and which remain unverified; do not treat prior evidence as a pass for a different build or environment.
3. Inspect the current branch, base commit, worktree, running dev server, and available devices/simulators. Preserve every existing change and evidence artifact. Do not start a competing dev server if port 8081 is already in use; inspect the existing process/configuration first.
4. Review the FE implementation and the BE repository at `/Users/rizkyrachmawan/MyProject/telkomsel/assessment/rusuh-booking-be` for event discovery/filtering, queue, booking session, booking, cancellation, payment status, payment page/SNAP, and relevant notifications. Do not edit the BE repository.
5. Compare handlers, OpenAPI contracts, request/response DTOs, auth/visitor identity, idempotency behavior, status transitions, and error responses. Record mismatches before proposing a fix. Do not invent an endpoint, field, status, or contract assumption.
6. For event filters, identify the actual FE repository/port and the exact BE list/search/filter endpoint (method, path, query parameters, default behavior, sort options, and response shape). Verify whether Home and Browse use the same source and whether filtering is server-side or client-side. If the BE does not support a filter, document the gap and preserve the agreed client-side behavior; do not silently change the BE contract.

### 2. Environment and test-data safety

1. Use the real development BE with mocks disabled for live end-to-end runs. Use the project’s local development server on port `8081` after checking whether one is already running. Record only non-secret environment identifiers and the build/commit.
2. Test as a guest for the primary flows. Also run a signed-in comparison where account state could affect restoration or saved data.
3. Use the previously approved development test identity from the secure local test-data source. Use a clearly identifiable synthetic name and the approved test email. If an NIK is unavailable, follow the approved test-data rotation procedure.
4. Never put a raw NIK in this document, source code, logs, screenshots, recordings, network dumps, or evidence. Never save bearer tokens, visitor credentials, payment credentials, raw sensitive request bodies, or unmasked personal data. Use masked/redacted values in notes.
5. Creating and cancelling development queue entries and bookings is authorized. Do not complete a real financial payment. Use only an available provider sandbox/test method. If safe payment completion is unavailable, mark payment-success scenarios blocked/unverified and test the FE decision logic with focused automated tests.

### 3. Invariants for every scenario

- BE status and deadline are authoritative for queue, checkout, booking, payment, cancellation, and expiry. Compute displayed remaining time from the server clock and original server deadline; never substitute device time or a hard-coded TTL.
- An active journey may resume after app restart, browser refresh/reopen, or a relevant notification tap only after the FE verifies current BE state.
- A confirmed terminal journey must not be reopened by an old route, notification, saved reference, or stale queue membership. Return Home when that is the product outcome and allow a fresh journey.
- A cancellation request is not proof of cancellation. Wait for or reconcile the BE result. If the result is uncertain, show recovery/retry and do not claim success.
- A BE-confirmed `PAID` result wins over a pending cancellation, timeout assumption, or stale local state and routes to Success.
- Connectivity loss alone never cancels a journey or proves expiry/payment success. Reconcile with BE after reconnect.
- Persist only the minimum non-sensitive journey reference needed for recovery. Do not persist raw NIK; after process restart, ask the guest to re-enter it when required.
- Preserve the original server deadline and guest access. Prevent duplicate queue joins, bookings, attempts, pollers, and cancellation actions. Reuse the existing idempotency key for an uncertain retry.
- Keep payment instrument entry on the provider-hosted SNAP page. Do not add card, VA credential, or e-wallet PIN fields to FE.

### 4. Common guest journey setup

Use this setup when a scenario says “start at Checkout” or “start at Payment.” Use a fresh, isolated development journey for each case unless that case explicitly tests resuming the same journey.

1. Open Home or Browse without signing in.
2. Find and open an available development event. Record the event label in evidence only if it is non-sensitive.
3. Open Event Detail and select **Masuk Antrean**.
4. Observe the queue response. Continue through Waiting Room if the BE returns `WAITING`; proceed to Checkout only when the BE authorizes admission. Record sanitized status transitions.
5. On Checkout, enter a synthetic buyer name, the approved test email, and the approved test NIK when required. Select one available ticket category, complete the required consent, and continue.
6. Confirm the BE created one booking and the app reached Payment. Do not create a payment attempt unless the scenario requires it.
7. For scenarios that begin at Payment, use a new independent booking unless the scenario is explicitly about an existing attempt or cancellation race.

### 5. Sequential test scenarios

#### A. Explicit Payment Back, cancel, and re-enter the same event

1. Follow Common Guest Journey Setup through Payment.
2. Press the app/browser Back control before opening SNAP.
3. Confirm that the **Tinggalkan pembayaran** dialog appears.
4. In a separate fresh run, choose the dialog’s stay/continue option. Verify the dialog closes, Payment remains active, and the user can choose a method without duplicating the booking.
5. In the cancellation run, reopen the dialog and choose **Ya, keluar**.
6. Verify the FE calls the supported cancellation path and reconciles the BE result before routing.
7. Confirm Home is shown only after a terminal result consistent with the response; if the result is uncertain, verify that recovery is shown instead.
8. Open the same event again, enter the queue, and verify this is a fresh valid journey rather than the old booking/session.
9. Cancel the fresh journey through the supported UI and verify Home and terminal cleanup.

#### B. Checkout expires while the app is closed

1. Follow Common Guest Journey Setup to Checkout as a guest.
2. Force-close the app while Checkout is active.
3. Wait until the BE checkout deadline has passed; do not infer expiry from a local timer alone.
4. Reopen the app.
5. Verify the FE fetches/reconciles server state before routing.
6. If BE confirms expiry, verify stale checkout and queue references are cleared, Home is shown, and a fresh queue can be started.
7. If BE status cannot be reached, verify the FE shows retry/recovery and does not declare expiry or create a duplicate booking.

#### C. Payment expires while the app is closed before SNAP

1. Follow Common Guest Journey Setup through Payment; do not open SNAP.
2. Force-close the app and wait past the BE payment deadline.
3. Reopen the app.
4. Verify the FE checks payment/booking status with BE before routing.
5. If BE confirms a terminal expired state, verify stale payment and queue references are cleared and the user returns to Home.
6. If verification is unavailable or status is `VERIFYING`/unknown, verify the app presents a recoverable state rather than falsely reporting expiry or cancellation.

#### D. Tap an old timeout notification

1. Reach Payment and close the app while the journey is active.
2. Wait for the relevant development timeout notification, if the environment supports it.
3. After the BE deadline, tap the notification.
4. Verify the notification reference is validated and the FE checks BE state before opening a route.
5. If BE confirms expiry, verify the app does not reopen Checkout or Payment and routes to Home as expected.
6. If notification delivery is unavailable, mark the live notification step blocked and cover stale-notification routing with a focused test.

#### E. Tap an old notification after explicit cancellation

1. Reach Payment and retain a relevant notification/reference for the booking.
2. Use the app’s Back flow and confirm exit.
3. Verify cancellation is confirmed by BE or that an uncertain/locked result is reconciled without a false success message.
4. Tap the old notification.
5. Verify a confirmed cancelled booking cannot be restored and the app remains/routes Home.

#### F. Force-close while SNAP is open, then resume

1. Reach Payment and open the existing BE-issued SNAP URL.
2. Force-close the app while SNAP is open, before the deadline.
3. Reopen the app without tapping a notification.
4. Verify the FE checks current BE status before routing.
5. If the active attempt is resumable and BE/provider supports reopening it, verify Payment appears with **Kembali ke SNAP** and that it reopens the same attempt without creating a duplicate.
6. If the provider URL cannot be reused, document the BE/provider contract limitation and the safe recovery shown to the user.

#### G. Payment completes while the app is closed

1. Reach Payment and open SNAP using only an approved sandbox/test payment method.
2. Close the app while the sandbox payment is being completed.
3. Reopen after the BE confirms `PAID`.
4. Verify the FE reconciles status and routes to Success.
5. Verify it does not cancel, create another attempt, or show an unpaid/expired result.
6. If safe sandbox completion is unavailable, mark the live case unverified and add/execute meaningful automated tests for the PAID-versus-cancel/expiry routing decision.

#### H. Restart offline, then reconnect before deadline

1. Reach Checkout as a guest and force-close the app.
2. Enable airplane mode and reopen.
3. Verify the app preserves only the minimum journey reference, shows a clear offline/retry state, and does not cancel or claim expiry.
4. Restore connectivity before the original BE deadline.
5. Verify the FE refreshes server time and journey status, then resumes the same active Checkout if BE confirms it remains active.
6. Repeat steps 1–5 from active Payment. Verify the same booking is restored and no duplicate attempt or poller is created.

#### I. Deadline passes while offline

1. Reach active Checkout, disable connectivity, and remain offline beyond the displayed deadline.
2. Reconnect.
3. Verify the FE fetches authoritative status/time and routes only from the BE result.
4. Repeat from Payment.
5. Verify no state is declared expired, paid, or cancelled solely from offline elapsed device time.

#### J. Cancellation response is uncertain

1. Reach Payment and initiate the explicit exit/cancel flow.
2. Interrupt connectivity while the cancellation request is in flight.
3. Verify the app does not display confirmed cancellation while the result is unknown.
4. Reconnect and retry/reconcile using the existing idempotency behavior and BE status.
5. Verify the final route matches BE state: cancelled/expired returns Home, still payable offers safe recovery, and paid routes Success.
6. Verify duplicate retries do not create duplicate cancellation or payment actions.

#### K. Payment and cancellation race

1. Use an approved sandbox method and begin a payment attempt.
2. While provider completion is in progress, initiate cancellation if the UI/contract permits it.
3. Reconcile against BE status.
4. Verify `PAID` wins and routes to Success. If outcome is unknown, verify the app shows recovery and retries status safely; do not claim cancellation.
5. If the provider/BE cannot reproduce this live, document the blocker and cover the status-state race in automated tests.

#### L. Repeated restarts on active journeys

1. Reach active Checkout and force-close/reopen at least five times before its original deadline.
2. After each reopen, verify the same active journey is restored from BE state and the displayed deadline continues from the original server deadline.
3. Repeat from active Payment.
4. Confirm there is at most one active queue entry, booking, attempt, status poller, and cancellation action for the journey.

#### M. Force-close during Checkout submission

1. Reach Checkout and complete the required guest form.
2. Press **Lanjut Bayar** and force-close while the booking request is in flight.
3. Reopen the app and reconcile with BE.
4. If BE created a booking, verify the same booking’s Payment page is restored.
5. If BE did not create a booking, verify the user can retry safely using the existing idempotency key and valid session.
6. Confirm no duplicate booking is created in either case.

#### N. Cancel and re-enter the same event

1. Restore an active Checkout and explicitly cancel it.
2. Return Home, choose the same event, and enter the queue again.
3. Verify the new journey is valid and not taken over by old attendee, checkout, payment, queue, or notification state.
4. Repeat from Payment, using the supported cancellation flow.
5. Verify old references are cleared only after BE confirms the terminal result; a genuinely uncertain result must remain recoverable.

#### O. Guest personal data after restart

1. Enter synthetic guest/attendee data in Checkout, including an approved test NIK.
2. Force-close and reopen before submitting.
3. Verify raw NIK is not restored from persistent storage and is not present in URLs/logs/evidence.
4. Enter different valid test data and continue.
5. Verify the new input is used for attendee validation and booking; old input is not submitted.
6. Verify validation/API errors are handled without an uncaught exception.

#### P. Old notification during a newer journey

1. Complete or cancel journey A and retain a notification/reference for A.
2. Start a new active journey B.
3. Tap A’s notification while B is active.
4. Verify the FE checks A’s referenced BE state without silently replacing, cancelling, or corrupting B.
5. Record the user-visible result and any product decision needed if the app cannot safely present both journeys.

#### Q. Web lifecycle equivalents

1. Repeat applicable Checkout and Payment cases on web using browser refresh, internal Back, browser Back, page/tab close, and later reopen.
2. Test SNAP handoff/return only with the approved sandbox environment.
3. Repeat offline/reconnect and stale-link/old-notification cases where supported.
4. Treat unload/page-hide cancellation as best effort; on return, reconcile with BE instead of assuming cancellation.
5. Verify the web guest flow remains available and signed-in state does not leak into the guest journey.

#### R. Home and Browse filters plus BE API alignment

1. On Home, record default event order and visible filter controls before selecting anything.
2. Select a category. Verify the selected category replaces `SEMUA` and the category, time (`waktu`), sort order (`urutan`), and clear-filter action remain usable in one row at desktop and narrow/mobile widths.
3. Apply time and sort filters. Verify the displayed controls and event results match the applied filter state.
4. Use **HAPUS PENYARINGAN** and verify default state and results are restored.
5. Navigate Home → Browse and Browse → Home. Verify both screens reflect the intended shared/applied filter state; test refresh and browser Back where applicable.
6. Repeat the same filter sequence directly on Browse, including a narrow viewport and native layout when available.
7. Trace each screen through FE hooks/use cases/repository to the actual BE route. In the BE repository, locate the handler and OpenAPI definition. Record the method, exact path, supported query parameters, defaults, ordering, pagination, authentication, and response fields that affect filters.
8. Verify whether filtering is done by BE or FE. If filters are currently client-side due to a missing contract, state that clearly and do not invent a server endpoint. If an endpoint exists, compare the FE request and result mapping with the BE contract and test a real development response.
9. Record any mismatch or missing contract as a FE-BE alignment issue with source references; do not edit BE or change a consumed contract assumption without authorization.

#### S. Signed-in comparison

1. Run one representative Checkout/Payment recovery flow while signed in, using a separate approved test account and isolated test booking.
2. Restart during Checkout and Payment, then compare restoration, account autofill, visitor/account identity, logout/session changes, and filter behavior with guest results.
3. Verify a signed-in journey cannot overwrite or expose the guest journey and vice versa.
4. Do not capture account credentials or unmasked personal values in evidence.

#### T. Logout and local data cleanup

1. Sign in with a separate approved development test account and verify the app has account-scoped profile/autofill data.
2. Create or restore a test journey only if the logout behavior being tested explicitly covers active journey state; record its BE status first.
3. Sign out using the app UI. Verify the supported server logout/revocation action is attempted where required, then verify local auth credentials, profile/PII, saved checkout input, payment/queue recovery references, and account-scoped query/cache state are cleared according to project policy.
4. If the server logout request fails, verify local sign-out still follows the approved security behavior and the UI does not falsely report server-side revocation. Reconcile any active booking separately with BE; do not silently cancel a guest-resumable booking solely because the app went offline.
5. Reopen the app and verify the prior account data is not restored. Confirm guest browsing and checkout remain available.
6. Do not inspect, print, or save raw storage values. Record only sanitized presence/absence checks and the relevant BE outcome.

### 6. Fix, regression, and evidence loop

1. Reproduce each failure before changing code where possible. Record the initial state, platform/build, exact user actions, sanitized request/response/status transitions, expected result, actual result, and likely owner (FE, BE, provider, or environment).
2. Before any code edit, map the file to the Clean Architecture layer and read the relevant contract/rule. Keep domain/application framework-free, keep presentation off infrastructure adapters, bind concretes only at the composition root, and use existing ports/use cases.
3. Fix confirmed FE defects only. Do not add dependencies or change BE contract assumptions without required authorization. If a required behavior depends on BE/provider support, record the precise endpoint/contract evidence and stop short of claiming it works.
4. Add focused regression coverage for confirmed fixes, especially expiry, stale notification, cancellation uncertainty, PAID/cancel races, duplicate prevention, offline recovery, and filter state/API mapping.
5. Re-run the failed journey and relevant prior paths after each fix. Use available Android/iOS devices or simulators and a browser; identify unavailable platforms rather than implying coverage.
6. Run the project-required targeted automated checks, typecheck, lint, and applicable architecture checks. Do not put end-to-end or contract checks in the cloud CI gate.
7. Save sanitized evidence under `.genesis/evidence/RBT-140/`. Never save raw NIK, tokens, payment credentials, sensitive request bodies, or unredacted screenshots. If Chucker excludes an endpoint, use a safe alternative or state that the request was not directly observed.
8. Identify native dependency/configuration changes and state whether each fix needs a new native build or can ship via OTA. Web changes require web deployment.

### 7. Required final report

Report:

- Each scenario A–S by platform as **passed**, **failed**, **blocked**, or **not run**. Include evidence references and do not treat a code test as a live end-to-end pass.
- Initial conditions, build/commit, relevant sanitized API calls and status transitions, expected vs. actual result, and the root cause for failures.
- FE fixes and relevant source/test file references.
- Home/Browse filter behavior, exact BE API mapping (or confirmed contract gap), and any FE-BE mismatch.
- Automated checks run and sanitized evidence locations.
- BE/provider/test-environment dependencies and every scenario that remains unverified.
- Whether a native rebuild, OTA update, or web deployment is required.
- Current branch and worktree status. Preserve all uncommitted work.

Do not commit, push, create a PR, merge, or close issues unless separately instructed.

## Existing RBT-140 evidence references

Use these as historical context and inspect their actual contents before deciding what to rerun:

- `.genesis/evidence/RBT-140/web-guest-recovery-2026-11-13.md`
- `.genesis/evidence/RBT-140/android-guest-recovery-2026-11-13.md`
- `.genesis/evidence/RBT-140/android-offline-checkout-2026-11-13.md`
- `.genesis/evidence/RBT-140/ios-stale-queue-recovery-2026-11-13.md`
- `.genesis/evidence/RBT-140/payment-timeout-and-cancel-repro-analysis.md`
- `.genesis/evidence/RBT-140/attendee-check-stale-nik-analysis.md`
- `.genesis/evidence/RBT-140/full-regression-2026-11-13/`
- `.genesis/docs/05-TASK-LIST.md` (RBT-140 acceptance criteria and recorded execution status)
