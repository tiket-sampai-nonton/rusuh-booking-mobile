# RBT-085 — Native mobile prototype parity verification

Date: 2026-11-04
Branch: `feature/RBT-085-native-prototype-parity`
Issue: https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/107

## Scope

P0, P1, and P2 native parity changes for the mobile prototype in `.genesis/prototype/v2-mobile`, covering Home, Browse, Event Detail, Waiting Room, Checkout/Payment/SNAP, My Tickets, Profile, Expired, and Success.

## Automated verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test -- --runInBand --forceExit --silent` | 103 suites passed; 804 tests passed |
| `npx expo export --platform web` | Passed; 29 static routes exported |
| `git diff --check` | Passed |

## Acceptance coverage

- Native route identity now includes `/my-tickets` and `/profile`.
- Home uses the mobile static hero composition and three-stat ending.
- Browse has mobile search, wishlist count, card wishlist controls, and mobile category labels.
- Waiting Room has prototype-sized ring/title spacing and safe-area-aware header padding.
- Event Detail hides web-only sections on native while retaining the booking CTA and mobile chrome.
- Payment/SNAP keeps the FE payment-instrument boundary and exposes the local method-selection simulator.
- Success ticket cards expose event and attendee context with masked NIK.
- Expired actions use accessible pressable controls.

## Known contract-dependent items

- My Tickets uses the current session/event data because no ticket-list/download port exists yet.
- Real SNAP page-token/WebView behavior remains dependent on the O2 contract.
- `03-checkout.html` is not merged into `/checkout` because its card-entry controls conflict with the locked payment boundary.
- SVG/icon, hard-shadow, bundled JetBrains Mono, loader-wipe, and exact scroll-triggered motion remain polish candidates.
