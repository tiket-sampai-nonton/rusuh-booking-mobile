# OBSERVABILITY.md — Rusuh Booking Tiket (FE)

> GENESIS Phase 2 output. **FE-side** observability. Requirement NFR-09 (queue/conversion/expired metrics)
> is largely BE-owned; this doc covers what the **client** emits and monitors so FE health and the
> user-facing funnel are visible. Conforms to `GROOMING-DECISIONS.md`, `ARCHITECTURE.md`.

## 1. Scope split

| Owner | Metrics |
|---|---|
| **BE** | Queue depth/rate, admission rate, server conversion, expired rate, oversell=0 invariant, API latency (p95<1s, NFR-06), payment settlement. |
| **FE (this doc)** | Client funnel events, perceived performance (Web Vitals), error/crash telemetry, polling behavior, native/web push health. |

## 2. FE funnel events (analytics)

Emit structured, **PII-free** events (no NIK/email/token in properties — only IDs that are safe, e.g. `eventId`, hashed/opaque `sessionId`):

| Event | When |
|---|---|
| `event_list_viewed` | Home/Browse rendered |
| `event_detail_viewed` | Event page |
| `queue_joined` | join succeeds |
| `queue_admitted` | status → ADMITTED |
| `queue_abandoned` | user leaves / TURN_MISSED |
| `checkout_started` | booking session created |
| `nik_check_result` | attendee-check result (result enum only, never the NIK) |
| `hold_succeeded` / `hold_failed` | `POST /bookings` outcome (+ errorCode) |
| `payment_attempt_created` | create-attempt |
| `payment_result` | PAID / FAILED / EXPIRED (+ method bucket, no card data) |
| `ticket_viewed` / `ticket_downloaded` | success page |
| funnel drop-offs | derived from the above |

These let the team see FE-side conversion and where users drop, complementing BE conversion metrics.

## 3. Performance (Web Vitals + RN)

Monitor against budgets (D6.6):

| Metric | Target | Source |
|---|---|---|
| p75 LCP | ≤ 2.5s | web-vitals on public routes |
| INP | ≤ 200ms | web-vitals |
| CLS | ≤ 0.1 | web-vitals |
| Initial JS (every route) | ≤ 1MB gzip | CI bundle gate + RUM |
| Native TTI / frame drops | tracked | RN perf monitor / device QA |

## 4. Error & crash telemetry

- Client error reporting (e.g. Sentry or the approved provider) for uncaught errors, failed critical mutations (hold/attempt), and crashes — with **NIK/payment/token redacted** before send.
- Capture `errorCode` + correlation ID (safe) so a FE error can be traced to a BE response.
- Alert on spikes in `hold_failed`, `payment_result=FAILED/EXPIRED`, or crash rate after a release.

## 5. Polling & request hygiene (stampede safety)

Observe to prove the FE doesn't amplify load (ARCHITECTURE §9.2):

- One active poller per queue session; adaptive interval honored; jitter applied; cancelled on unmount/background.
- Count duplicate/identical reads (should be deduped); track `Retry-After` compliance and backoff behavior.
- Dashboard: poll volume per waiting client vs expected — a regression here is a load risk.

## 6. Notification health (D8.2)

- Native: push token registration success rate, delivery/open (where measurable), permission grant rate.
- Web push: service-worker registration success, permission grant rate, push received/clicked.

## 7. Release observability (from PIPELINE.md §11)

Every release records Git SHA, Expo runtime version, channel, update ID, web deployment ID. Post-release monitor:
- Native OTA adoption + crash rate → roll back OTA if material regression.
- Web route health + Web Vitals → redeploy previous artifact if regressed.
- Critical booking-flow funnel metrics (hold/payment success) as the release health signal.

## 8. Correlation

- FE attaches a correlation ID per request (safe, non-PII) so FE events ↔ BE logs can be joined end-to-end across queue → booking → payment → notification.

## 9. Acceptance

1. Funnel events emitted at each step with **no PII** in properties.
2. Web Vitals reported and within budget on public routes.
3. Error telemetry redacts NIK/payment/token.
4. Poll-volume dashboard shows one poller/session, adaptive, cancelled on unmount.
5. Release dashboard shows OTA adoption + crash + funnel health with rollback trigger.
