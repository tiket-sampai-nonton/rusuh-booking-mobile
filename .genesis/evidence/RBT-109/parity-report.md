# RBT-109 Native Visual Parity Pass

Date: 2026-11-04
Branch: `feature/RBT-109-native-visual-parity`
Reference: `.genesis/prototype/v2-mobile/`
Device: iPhone 16 Pro Simulator, iOS 18.6
Status: **in progress; not a parity sign-off**

Tracker: GitHub issue [#109](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/109) remains open/in progress. Its current title still says `RBT-087`; an attempted title/body correction to `RBT-109` was rejected by the GitHub integration with HTTP 403 (`Resource not accessible by integration`). The local branch and evidence use `RBT-109` to avoid colliding with the existing RBT-087 evidence folder.

## Method and evidence

The prototype HTML/CSS and design tokens were read locally. Native before/after screenshots were captured from the running Expo app at the same simulator viewport and inspected screen by screen. This environment’s browser policy rejected opening the local prototype HTML, so there is no rendered prototype screenshot in this evidence set and exact pixel-difference measurement could not be done. Android was not available for a second native capture.

Captures are in `before/` and `after/` in this directory. Fixture/backend state is preserved; differences in names, prices, counts, or ticket data are not treated as layout defects.

## Route-by-route result

| Prototype | Native route | Capture / observed state | Result |
|---|---|---|---|
| `01-home.html` | `/` | [after/home.png](after/home.png) | Home header now has Search and Notifications; hero CTA contrast fixed to solid black with white label. Still partial: hero/carousel and below-fold sections/motion have not been fully compared against a rendered prototype. |
| `05-browse.html` | `/browse` | [before/browse.png](before/browse.png), [after/browse.png](after/browse.png) | Fixed the native-only structure: removed web hero, added fixed search/category bars, inset results, compact 36 px view buttons, and retained two-column cards and bottom nav. Remaining: card wishlist placement is visibly wrong on one card in the capture; search/category/view/wishlist states and scrolling animation were not exercised. |
| `02-event-detail.html` | `/events/[eventId]` | [before/events-evt-1.png](before/events-evt-1.png), [after/events-evt-1.png](after/events-evt-1.png) | Category border frame, row dividers, padding, and price/status alignment were corrected in the carried-over RBT-086 changes. Capture uses live fixture data (three categories vs the prototype’s sample list). Remaining: full long-page sections, gallery/modal, scroll chrome, and interaction states still need capture review. |
| `06-waiting.html` | `/waiting/[eventId]` | [after/waiting-evt-1.png](after/waiting-evt-1.png) | Could only reach “No Active Queue”; the normal queue, turn, and leave-confirm states are not visually verified because no queue session is available. |
| `07-ticket-selection.html` | `/checkout/[sessionId]` | [after/checkout-demo-session.png](after/checkout-demo-session.png) | Buyer fields, ticket rows, progress, and sticky total are captured. Needs comparison at additional scroll positions and input/validation/modal states. Timer/data reflect current session; no static prototype values were injected. |
| `03-checkout.html` | No distinct route; `/checkout` is the ticket-selection flow | Same as ticket-selection capture | Mapping remains ambiguous. Its payment-card fields are excluded to preserve the locked SNAP payment boundary. |
| `08-payment.html` | `/payment/[bookingId]` | [after/payment-demo-booking.png](after/payment-demo-booking.png) | Captured. Known visual mismatch from source/capture review: sticky payment bar composition differs from the prototype. Payment-method selection, warning/expiry, and handoff states still need verification. |
| `08a-snap.html` | `/snap/[bookingId]` simulator | [before/snap-demo-booking.png](before/snap-demo-booking.png), [after/snap-demo-booking.png](after/snap-demo-booking.png) | Fixed status-bar overlap and aligned the safe-area header and centered SNAP identity. Still partial: simulator controls differ from the prototype’s provider method/confirmation content; prototype countdown is omitted because this simulator has no server-authoritative expiry value. No card/payment-instrument collection was added. |
| `04-my-tickets.html` | `/my-tickets` | [after/my-tickets.png](after/my-tickets.png) | Empty state is captured. Prototype ticket-card, tabs with populated counts, QR modal, and share/download states are not verified because no confirmed ticket fixture is available. |
| `09-expired.html` | `/expired/[resourceId]` | [after/expired-demo-resource.png](after/expired-demo-resource.png) | Recovery state captured. Remaining icon/copy/action sizing and retry/back interactions need a rendered-reference review. |
| `10-success.html` | `/success/[bookingId]` | [after/success-demo-booking.png](after/success-demo-booking.png) | Route remains in “Menyiapkan tiket…” while payment status is unconfirmed. Success ticket/QR cannot be visually reviewed without authoritative paid state; it was not fabricated. |

### Additional native result gate (not a prototype HTML screen)

`/payment-result/[bookingId]` is the server-authoritative payment verifier. A cold deep link without `attemptId` disabled its query but previously left the normal spinner visible forever. This was reproduced by terminating Expo Go and opening `/payment-result/demo-booking`. The screen now presents an explicit missing-attempt message and **Kembali ke pembayaran** action; Payment’s existing Back control routes to Home. The repaired native capture is [after/payment-result-missing-attempt.png](after/payment-result-missing-attempt.png). Six targeted Payment Result tests pass, including the new recovery navigation assertion.

`/profile` is an app-only route with no screen in `v2-mobile`; it was captured at [after/profile.png](after/profile.png) and is outside this prototype parity comparison.

## Code changes in this pass

- Home native hero CTA now has a black fill and white foreground for readable contrast.
- Browse native composition now follows the prototype’s header/search/category/results hierarchy; the result frame and view controls use mobile sizing.
- Event Detail category framing fixes from the prior authorized work are retained; category tests now assert the prototype content instead of obsolete queue-explanatory copy.
- SNAP simulator now respects the top and bottom safe areas and uses the prototype’s fixed header and centered SNAP section identity. It still has a documented structural mismatch as listed above.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- Targeted tests (Event Detail screen/fragments, Browse, SNAP screen/actions) — 5 suites, 29 tests passed. The Payment Result suite separately passed 6 tests after adding the missing-attempt recovery path. Jest printed existing Reanimated `act(...)` warnings and remained alive after reporting success; it was stopped after the completed result.
- Live native screenshots — captured and inspected for all 11 mapped routes; several routes only reached empty/loading states described above.

## Remaining work before parity sign-off

1. Obtain a permitted rendered prototype capture/reference or side-by-side visual surface; current policy blocked local HTML rendering in the browser.
2. Fix Browse card wishlist placement, then exercise search, categories, grid/list, scroll, and press states with recapture.
3. Inspect the complete Event Detail and Checkout pages at successive scroll positions and capture dialogs/forms/sticky states.
4. Verify normal Waiting Room and paid Success states with stable existing fixtures or authoritative service state.
5. Review My Tickets populated/QR states, Payment handoff/sticky bar, and remaining Expired states.
6. Recheck iOS captures after fixes and run Android if a native emulator becomes available.

Because these gaps remain, this pass is not ready for G3 evidence approval, PR creation, or merge. The issue remains in progress; no release action was taken.
