# Native Prototype Diff Analysis

Date: 2026-11-04  
Scope: Expo native output on iPhone 16 Pro Simulator / iOS 18.6 compared with `.genesis/prototype/v2-mobile`  
App target checked: native React Native renderer; web was used only as a secondary cross-check at `localhost:8081`.

## Executive summary

The current native app already carries the V2 Brutalist Mono direction: white/black palette, 2px borders, Inter typography, JetBrains Mono waiting-room styling, grayscale imagery, sticky actions, and the four-item bottom navigation. Event Detail, Waiting Room, and the ticket-selection flow are the closest matches.

The largest gaps are structural rather than small pixel differences. The final exhaustive pass also found mobile-token, composition, and control differences that were easy to miss in a route-only review:

1. **The Tickets/Profile navigation contract is incomplete.** The prototype contains upcoming/past ticket cards, QR actions, download actions, and tabs. The current `/history` screen is an archived-event catalog only; Home points Tickets to `/my-tickets`, Browse points Tickets to `/history`, and both Home/Browse point Profile to `/profile`, but neither `/my-tickets` nor `/profile` exists in the native route tree.
2. **Browse uses the generic header instead of the prototype Browse header.** The prototype requires search, wishlist count, and card-level wishlist controls. The current native screen has the generic login header and no wishlist affordances.
3. **The payment handoff is not visually equivalent to the prototype SNAP screen.** The local `SnapSimulator` is a generic success/fail/unknown simulator, while `08a-snap.html` is a full payment-method UI. The production native handoff currently opens an absolute redirect with `Linking.openURL`, so it can leave the app instead of showing the in-app WebView route.
4. **The prototype has two checkout-like screens.** Current native `/checkout/[sessionId]` is functionally closest to `07-ticket-selection.html`, not `03-checkout.html`. The latter includes card-entry fields and therefore also conflicts with the project rule that SNAP owns payment-instrument collection; it must be confirmed as legacy or treated as a non-canonical reference.
5. **Native safe-area handling is visibly wrong in Waiting Room.** The native header/logo is drawn into the Dynamic Island/status-bar area in the observed simulator state.
6. **Home is not the same composition as the mobile reference.** Native uses an auto-advancing hero carousel and a substantially taller hero, while `01-home.html` uses one static 70vh hero. Native also mounts extra archive/footer content and does not mount the prototype’s three-stat banner.
7. **Browse is missing key prototype controls.** The native screen has no search field, wishlist header/count, or card wishlist buttons; it adds a non-functional native sort button and load-more button that do not exist in the mobile prototype.
8. **Mobile spacing and typography are not fully token-aligned.** Prototype mobile spacing uses 32px/48px large steps, while native semantic spacing uses 48px/80px in several screens. Native references JetBrains Mono but no bundled JetBrains font was found, so it can fall back to a system monospace font.

## Reference rules used

The comparison follows:

- `.genesis/prototype/v2-mobile/design-tokens.css`
- `.genesis/prototype/v2-mobile/DESIGN-PALETTE-GUIDE.md`
- `.genesis/docs/DESIGN-SYSTEM.md`
- `.genesis/docs/ARCHITECTURE.md`
- The current native screens under `apps/client/src/presentation/screens/`
- The current route tree under `apps/client/src/app/`

The prototype’s mobile visual contract is: `#fff` ground, `#000` ink, `#666` muted text, `#f5f5f5` field surfaces, red/green/orange status colors, Inter for general UI, JetBrains Mono for queue/counters, 2px black borders, hard offset shadows, 44px minimum touch targets, 56px header, 72px bottom navigation, safe-area padding, and reduced-motion support.

## Screen mapping

| Prototype | Current native route/screen | Match status |
|---|---|---|
| `01-home.html` | `/` → `HomeScreen` | Partial; strong visual foundation, header/hero behavior gaps |
| `05-browse.html` | `/browse` → `BrowseScreen` | Partial; catalog controls present, Browse chrome incomplete |
| `02-event-detail.html` | `/events/[eventId]` → `EventDetailScreen` | Closest match |
| `06-waiting.html` | `/waiting/[eventId]` → `WaitingRoomScreen` | Close visually; safe-area issue |
| `07-ticket-selection.html` | `/checkout/[sessionId]` → `CheckoutScreen` | Functionally close; extra progress/consent UI |
| `03-checkout.html` | Also `/checkout/[sessionId]` | No distinct native representation; mapping conflict |
| `08-payment.html` | `/payment/[bookingId]` → `PaymentScreen` | Partial; summary/instruction content reduced |
| `08a-snap.html` | `/snap/[bookingId]` simulator or native payment handoff | Major mismatch in simulator; handoff path needs verification |
| `04-my-tickets.html` | `/history` → `HistoryScreen` / bottom-nav Tickets | Major mismatch; wrong domain screen and route inconsistency |
| `09-expired.html` | `/expired/[resourceId]` → `ExpiredRecoveryScreen` | Functional recovery is stronger; visual/copy partial |
| `10-success.html` | `/success/[bookingId]` → `SuccessScreen` | Close; current adds authoritative verification and multi-ticket QR |

## Cross-screen findings

### What is already aligned

- Core palette, font intent, border weight, and major layout constants are aligned with the mobile prototype. Mobile spacing semantics are not fully aligned; see the final token audit below.
- Current native screens use square geometry and black hard borders rather than the older rounded/glass treatment.
- Event cards, hero sections, queue ring, checkout bar, payment bar, and success ticket card are all using the V2 visual vocabulary.
- Native bottom navigation has the expected four destinations, 72px height, top active indicator, press feedback, and safe-area bottom padding.
- Reduced-motion hooks are present in shared V2 components and the waiting-room animation layer.
- Native payment and booking logic correctly preserves server-authoritative timers and does not trust the device clock. This is an intentional behavior difference from the prototype’s client-side timer simulation.

### Global native gaps

- The generic `V2Header` exposes a login/enter icon on mobile. The prototype uses screen-specific chrome: Home uses Search + Notifications; Browse uses Wishlist + Search; My Tickets uses a header action; Event Detail uses Back + Share; booking screens use Back + Timer.
- Native hard shadows are approximated with React Native elevation in some shared components. The prototype requires crisp zero-blur offset shadows. Verify iOS and Android separately because elevation does not reproduce the CSS shadow exactly on iOS.
- Several screens use Unicode emoji/text symbols where the prototype uses SVG icons. This changes baseline alignment, glyph appearance, weight, and accessibility consistency across iOS/Android.
- Prototype English copy and current app Bahasa Indonesia copy are mixed by flow. This is acceptable only if the product language decision is explicit; otherwise it makes visual line wrapping and component heights differ from the reference.
- Fixture/event data differs from the HTML samples. Data differences should not be treated as visual defects, but screenshots used for acceptance should use a fixed reference fixture so layout comparison is deterministic.
- Prototype reveal effects are generally visibility-triggered with `IntersectionObserver`; native `V2Reveal` delays children from mount. This changes when motion starts during scrolling.
- Prototype loader exit uses a clip-path/wipe treatment on several screens. Native `V2Loader` approximates the exit with opacity and vertical translation because clip-path is not reproduced by the current native implementation.
- Prototype CSS shadows are crisp hard offsets; native shadow/elevation approximations remain platform-dependent, especially on iOS.
- The shared `ScreenFade` adds a route-level fade/translate transition that is not present in the individual HTML screen timelines. Treat it as an app-level addition, not a screen-match proof.

## Second-pass verification — 2026-11-04

The full comparison was repeated screen by screen across all eleven mobile prototype files, the native route tree/source, and the live iPhone simulator. The second pass confirms the original visual findings and adds these corrections:

- **Route completeness is a P0 issue, not only a visual mismatch.** The native app has routes for Home, Browse, Event Detail, Waiting, Checkout, Payment, SNAP, Success, Expired, and History, but no `/my-tickets` or `/profile` route. Home’s Tickets action therefore targets a missing route; Browse’s Tickets action opens the archive screen instead of the prototype My Tickets screen; Profile targets a missing route from both surfaces.
- **The live checkout state is the closest native implementation to `07-ticket-selection.html`.** The simulator showed the back/timer header, four-step strip, buyer fields, ticket/category controls, attendee fields, add-ticket action, quota warning, consent checkbox, and sticky total/pay bar. The extra progress and consent layers are product behavior differences, not evidence that the screen is missing.
- **`03-checkout.html` is not safe to use as a combined native checkout specification.** Its card number/expiry/CVV-style payment fields and promo flow conflict with the project’s locked payment boundary: the FE must not collect payment instruments and SNAP owns that UI. Keep its order-summary/contact-information ideas only if Product confirms it is a legacy reference and the payment fields are excluded.
- **Native screen chrome remains more generic than the prototypes.** The simulator/source review confirms that the shared mobile header still exposes the generic login/enter affordance on Home/Browse, while the prototypes specify screen-specific Search, Notifications, Wishlist, Back/Share, and ticket actions.
- **Waiting Room safe-area overlap remains reproducible in the prior simulator capture.** The `RUSUHTIKET` header/logo sits too close to the Dynamic Island; this is a native inset/layout defect rather than a prototype difference in content.

The refreshed conclusion is therefore: the booking path is substantially implemented, but native redesign sign-off is blocked by route identity/navigation, My Tickets/Profile absence, the canonical checkout decision, and payment-handoff ownership. Pixel-level animation and icon tuning should follow those structural decisions.

## Final exhaustive audit — 2026-11-04

This final pass read all eleven prototype HTML screens, `design-tokens.css`, `DESIGN-PALETTE-GUIDE.md`, every native route in `apps/client/src/app/`, and the screen-specific components/styles under `apps/client/src/presentation/`. The following findings are the complete screen-level corrections to the earlier report.

### Home — additional concrete differences

- `01-home.html` has one static featured hero with a breathing image. Native `V2HeroCarousel` auto-advances through up to three events every six seconds. Native hides carousel dots on phone, but the content still changes automatically; this is a behavior mismatch, not only a data mismatch.
- Prototype mobile hero height is `70vh`. Native `useResponsive()` supplies `heroHeightVh: 80`, and `V2HeroCarousel` also enforces a minimum height of 480px. The native hero therefore occupies materially more vertical space on an iPhone.
- Prototype mobile hero padding uses the 32px large spacing step. Native hero uses the larger shared semantic spacing value, increasing the title/CTA position and reducing the amount of the next section visible above the bottom navigation.
- Prototype Home uses a white Upcoming section and ends its mobile content with a three-counter stats banner (`50`, `100K+`, `25+`) before bottom navigation. Native uses a field-gray event section, does not mount `V2HomeMarketing`/the stats banner, always mounts `V2HomeFooter`, and can mount a previous-events/history section. The content order and page ending are therefore different.
- The existing native `HomeMarketing` component is not equivalent even if mounted: it defines four different statistics (`2.5M+`, `500+`, `1M+`, `99.9%`) plus additional marketing content absent from the mobile HTML.
- Prototype Home loader uses a black logo/progress treatment with a clip-path wipe. Native uses the shared fade/translate loader approximation.
- Native’s single `Get Tickets` CTA is closer to the mobile prototype than the desktop-style secondary CTA, but its contrast must be verified because the observed screenshot showed it nearly blending into the lower hero gradient.

### Browse — additional concrete differences

- The prototype has a search input/button in the fixed header region. Native `BrowseScreen` renders only the title; `browseSearchBox`, `browseSearchInput`, and `browseSearchBtn` styles exist but are not used, and the URL `q` value is not connected to a visible search interaction.
- Prototype Browse header includes wishlist count and card-level heart controls. Native uses the generic login/enter header and reuses `V2EventCard`, so no per-card wishlist state, heart-pop animation, or wishlist count exists.
- Prototype categories are `All`, `Concerts`, `Festivals`, `Sports`, and `Theater`, fixed below the header while results scroll. Native categories are `All Events`, `Concerts`, `Festivals`, `Electronic`, `Rock`, and `Jazz`, and they scroll as ordinary content. Filtering is a best-effort name/venue substring check rather than the prototype’s category model.
- Native adds a `Sort by Date` Pressable on native, but it has no handler. The mobile prototype has no sort control. Native also renders `Load More Events`; its handler only disables the button and does not append data, while the prototype has no load-more control.
- Prototype cards use compact image/date/title/venue/price composition with a heart overlay. Native cards use the shared home/event-card composition with `Mulai dari`, generic badges, and an arrow action. The two-column geometry is similar, but the card information hierarchy is not.
- Prototype Browse loader is white with black branding. The shared native loader is black, so the initial loading surface is inverted.

### Event Detail — additional concrete differences

- Native renders extra `Lokasi`/venue map, `Galeri`/gallery-lightbox, and `Syarat & Ketentuan` sections/fallback content. The mobile `02-event-detail.html` reference contains Info, Categories, About, and Lineup followed by the fixed CTA; the extra native sections create a longer page and different scroll landmarks.
- Native category fallback descriptions are generated as `Kode ${c.code}` when the contract lacks a description. The prototype uses human-readable descriptions such as `Front row + Meet & Greet`; this is visible content drift.
- Native detail header uses 24px horizontal padding while the mobile prototype uses a 16px frame. The 50vh hero and Back/Share treatment are close, but section spacing and the 24px content padding create cumulative vertical drift.
- Native Venue uses an emoji map-pin fallback in places where the prototype uses vector iconography. Lineup/venue/gallery demo assets can also change the image composition relative to the sample HTML.
- The native CTA label is domain-driven (`Masuk Antrean`) while the prototype label is `Beli Tiket`. The route behavior is intentionally different, but the copy/visual comparison should record it as a product decision.

### Waiting Room — exact dimension and inset differences

- Prototype mobile specifies a 20px logo, 24px event title, and a 200px ring with 6px stroke and radius 90. Native uses a 24px logo, 32px event title, and `RING_SIZE=220`, `RING_RADIUS=100`, `RING_STROKE=8`.
- Prototype vertical rhythm is approximately badge 24px → event info 32px → ring 24px → zone 24px. Native uses larger 32px/48px gaps, making the queue content materially taller.
- Native Waiting header does not apply `useSafeAreaInsets().top`; this is the source-level cause of the observed Dynamic Island overlap.
- Native has richer server-backed states, polling, claim handling, offline/warning states, and redirect logic. The prototype uses local random simulation. Preserve the native behavior; classify this as intentional product logic, not a request to copy the simulation.

### Checkout and payment boundary

- Current `/checkout` is a hybrid: its four-step strip comes from `03-checkout.html`, while buyer NIK/email, ticket rows, attendee fields, quota warning, consent, and server hold come from `07-ticket-selection.html`. It does not render the legacy screen’s contact first/last name/phone, order summary lines, card fields, promo field, or processing overlay.
- `03-checkout.html` collects card number/expiry/CVV. Under the locked architecture this is contract-incompatible and must remain legacy/reference-only unless Product changes the payment boundary; SNAP owns payment-instrument collection.
- Native Payment is structurally sound for the server contract, but its order summary only shows `Pesanan {bookingId}` and total. The prototype shows event name, venue, ticket lines, and total.
- Native payment methods are server-driven and intentionally hand off to SNAP, so the prototype’s local VA/QRIS/GoPay instruction panels are not rendered. This is acceptable only if the handoff is explicitly the canonical UX.
- Native payment sticky bar is visually inverted relative to `08-payment.html`: current outer bar is black with a white Pay button, while the prototype uses a white bottom bar with a black Pay Now button.
- Native payment header/copy are Bahasa (`Kembali`, `Lanjut Bayar`, etc.) while the prototype is English, changing line wrapping and control height.

### SNAP — structural mismatch, not just styling

- `08a-snap.html` contains Bank Transfer/E-Wallet tabs, bank list, VA detail/copy/instructions, wallet choices, QR panel, and Confirm Payment processing. Native `SnapSimulatorScreen` contains only a compact summary and Success/Fail/Unknown test actions.
- The simulator is useful for O2/payment-state testing, but it is not a visual implementation of the prototype. Do not close this diff by collecting payment data in the app.
- Relative mock handoff URLs route to `/snap`; absolute native URLs use `Linking.openURL`, which can leave the app. `/payment-webview` exists but is not selected by that absolute path in the reviewed code. The real page-token/WebView contract must decide the final behavior.

### My Tickets, History, and Profile

- The mobile prototype’s My Tickets screen includes search, Upcoming/Past tabs with counts, upcoming and past ticket cards, QR reveal modal, download/share action, and Tickets-selected bottom navigation.
- Native History is an archive catalog, not a ticket wallet: no ticket entity cards, tabs, QR, download, modal, or bottom navigation. This remains the clearest P0 screen-identity mismatch.
- Native has no `/my-tickets` or `/profile` route despite Home/Browse bottom navigation targeting them. This must be fixed as a route contract, not papered over with a visual alias.

### Expired and Success

- Expired is close in hierarchy and has stronger recovery logic. The prototype icon is 100px; native uses a 96px utility. Native action labels are rendered as `Text` with `onPress` rather than explicit `Pressable` controls, so hit-target, focus, and accessibility fidelity should be verified.
- Success has the correct dark/success structure and stronger server verification, but native `ETicketCard` only shows an e-ticket index, QR, safe reference, and QR instruction. It omits the prototype’s event title, attendee, NIK, category, date, time, venue, and ticket code fields.
- Native success icon is a green 3px ring; prototype uses an 80px white 2px ring on the dark surface. This is a direct visual mismatch.
- Native supports multiple verified ticket cards and masks NIK, which is correct product/security behavior even though it differs from the single sample card in the HTML.

### Final shared token and motion audit

- Prototype mobile spacing is `xs=8`, `s=16`, `m=24`, `l=32`, `xl=48`. Current native semantic spacing defines `l=48` and `xl=80` and several screens consume those values directly. This is the likely source of the large vertical drift in Home, Event Detail, and Waiting; the shared token map is not fully mobile-equivalent.
- Native loads Inter, but the reviewed package/source does not load a JetBrains Mono font package even though Waiting and checkout timers request `fontFamily: "JetBrains Mono"`. Native may fall back to a platform monospace font, changing counter width and baseline.
- Prototype Home/Detail/Browse reveals are triggered by viewport intersection. Native `V2Reveal` uses mount-time delayed reveals, so off-screen cards can animate before the user reaches them.
- Prototype uses 150ms/300ms/500ms motion durations and screen-specific settle/stagger/press effects. Native has shared reveal/fade/reanimated behavior, but loader wipe, hero breathing/parallax, wishlist heart pop, QR reveal, and some screen-specific sequencing are not reproduced exactly.
- Native has a `SafeAreaProvider`, but safe-area consumption is inconsistent across screen-specific headers. Waiting is the verified failure; audit all fixed headers/bottom bars on cutout devices.

## Screen-by-screen diff

### 1. Home — `01-home.html` vs `HomeScreen`

Prototype reference:

- Fixed 56px mobile header with `Rusuh Tiket`, Search, and Notifications buttons.
- Full-height hero with grayscale image, white gradient overlay, live badge, large title, date/location metadata, primary CTA, and ghost CTA.
- Loader with `RUSUH` letter treatment and progress bar.
- Upcoming/history and marketing sections followed by fixed four-item bottom navigation.
- Entrance motion: header slide-down, hero settle/fade-up, live badge pulse, bottom-nav slide-up, and reduced-motion fallback.

Observed/current native:

- Simulator showed the V2 hero, event metadata, black live badge, and four-item bottom nav.
- The native header showed `RUSUH TIKET` plus a login/enter icon, not Search + Notifications.
- The hero CTA was visually weak/near-white against the lower gradient in the observed screenshot; the prototype’s primary CTA is a clearly visible black button and the ghost CTA remains separately visible.
- Current Home is data-driven and can render a carousel/sections; the prototype reference is a fixed static sample. This is a data/behavior difference, not necessarily a defect.

Required follow-up:

- Add screen-specific Home actions or make the native header support the prototype’s Search and Notifications buttons.
- Verify hero CTA contrast and clipping at the iPhone 16 Pro viewport.
- Confirm whether the current multi-event carousel is the intended native behavior or whether the prototype’s single featured hero is canonical.

### 2. Browse — `05-browse.html` vs `BrowseScreen`

Prototype reference:

- Header with logo, Wishlist button/count, and search field.
- Sticky horizontal category bar below the header.
- Results count, sort control, grid/list toggle.
- Two-column mobile event cards with image, badge, card-level wishlist button, date, venue, and price.
- Active/press animation for category buttons, view toggle, wishlist heart pop, card reveal cascade, and bottom nav.

Observed/current native:

- Black `Find Your Next Event` hero is present.
- Horizontal category controls, result count, sort control, grid/list controls, two-column cards, and bottom nav are present.
- Header is the generic logo/login header; there is no Browse search input or Wishlist count.
- Accessibility output exposed event-card buttons but no per-card wishlist controls.
- Current source implements category filtering, sort/view state, and a load-more button, but `handleLoadMore` only disables the button; it does not load or append more events.

Diff severity: **P1 visual/interaction gap; P2 for load-more behavior if the catalog is intentionally fixture-sized.**

### 3. Event Detail — `02-event-detail.html` vs `EventDetailScreen`

Prototype reference:

- Grayscale hero image with white bottom gradient.
- Transparent header that becomes solid with a bottom border after scrolling.
- Native Back + Share icon buttons.
- Info card for date/location.
- Ticket categories with description, price, and availability.
- About, horizontal snap lineup, venue map, gallery/lightbox, terms, and fixed floating CTA.
- Hero settle, staggered section/category/lineup reveals, CTA slide-up, CTA pulse, and active press translation.

Observed/current native:

- This was the closest observed match. The simulator showed the grayscale hero, `PENJUALAN DIBUKA` badge, title, date/location card, category list, sticky price/CTA, and native Back/Share chrome.
- Accessibility output exposed About, Line Up, Location, Gallery, and Terms sections.
- Native intentionally hides the flow-step indicator and wishlist control, matching the mobile-specific component comment.
- Current native intentionally omits the `JAMINAN KAMI` trust block; the source renders it only for web. This is consistent with the component comment but differs from the full prototype content order.
- Prototype categories include descriptions; current live fixture category output exposes code/status/price but not a category description field.
- Venue and lineup images use demo/fallback assets when contract data is absent; this can make the native screenshot differ from the prototype image composition.

Diff severity: **P2 for content/fallback differences; P1 if trust content and category descriptions are required in the native acceptance screenshot.**

### 4. Waiting Room — `06-waiting.html` vs `WaitingRoomScreen`

Prototype reference:

- Logo header with safe-area handling.
- `IN QUEUE` status badge.
- Circular position ring, zone banner, minutes/seconds estimate, explanatory text, Leave Queue button, and leave-confirm modal.
- State variants: normal queue, your turn/redirect countdown, sold out, session expired, turn expired, offline/reconnected.
- JetBrains Mono and 3px waiting-room borders.

Observed/current native:

- Simulator showed the ring at position 4, `IN QUEUE`, `POSSIBLE ZONE`, `00` minutes / `01` second, explanatory copy, and `LEAVE QUEUE`.
- The ring, warning zone, and queue copy are visually close to the prototype.
- Current queue logic is materially better than the HTML simulation: it uses server-authoritative state and polling rather than `Math.random` position updates. Preserve this behavior.
- The header/logo was visibly drawn into the Dynamic Island/status-bar region in the observed iPhone screenshot. The waiting header style has vertical padding but does not visibly apply the native top safe-area inset.
- Current adds network status and richer error-state handling; these are useful additions but should use the same spacing and modal treatment as the prototype.

Required follow-up:

- Apply `useSafeAreaInsets().top` to the waiting header or root content so the logo never overlaps the status bar/Dynamic Island.
- Check the `your turn` transition, five-second redirect countdown, and modal on native; the static queue state alone is not sufficient evidence.

### 5. Ticket Selection — `07-ticket-selection.html` vs native `/checkout`

Prototype reference:

- Back button and session timer.
- Compact event hero image/title/date.
- Buyer NIK and email fields.
- Ticket rows with category, attendee name, attendee NIK, and `Same as buyer` checkbox.
- Add Ticket, quota warning, sticky total/pay bar, and leave-confirm modal.

Observed/current native:

- Simulator showed Back, a server-driven countdown, a four-step progress strip, `PILIH TIKETMU`, buyer fields, ticket #1, category controls, attendee fields, consent, and sticky `LANJUT BAYAR` bar.
- The buyer/ticket form and quota warning are close to the prototype.
- Current adds a mandatory guest consent gate and server-side attendee/NIK validation status. These are required product/security behavior, but they add vertical content not present in the HTML reference.
- Current adds a four-step progress strip (`PILIH`, `DETAIL`, `BAYAR`, `SELESAI`) that is not present in `07-ticket-selection.html`.
- Current copy is Bahasa Indonesia while the prototype is English; wrapping and field heights differ.
- Current uses category selection buttons rather than the prototype’s select control. This is appropriate for native, but the selected/unselected press state needs to be checked against the square brutalist treatment.

Diff severity: **P1 mapping/layout difference; security/consent additions should remain.**

### 6. Legacy Checkout — `03-checkout.html` vs current native

The prototype folder also contains a separate `03-checkout.html` with:

- Order Summary first, including item image, ticket tier, quantity, subtotal, service fee, discount, and total.
- Contact Info with first name/last name/email/phone.
- Attendee information and payment methods.
- Promo code interaction, processing overlay, toast, and bottom Pay bar.

There is no separate native route for this screen. Current `/checkout/[sessionId]` renders the ticket-selection structure from `07-ticket-selection.html`, and payment is deferred to `/payment/[bookingId]`.

This is a **prototype mapping conflict**, not something to fix by blindly combining both screens. Product/FE should confirm whether `03-checkout.html` is legacy and `07-ticket-selection.html` is the canonical native screen. The current architecture’s separate Checkout → Payment split is consistent with the route tree and payment contract.

Important contract note: `03-checkout.html` visibly collects card payment details. That interaction must not be copied into the native app under the current project rules; if the screen remains a reference, its payment section is legacy/contract-incompatible and SNAP must remain the payment-instrument owner.

### 7. Payment — `08-payment.html` vs `PaymentScreen`

Prototype reference:

- Back + timer header.
- Hold/status banner.
- Order summary with event name, venue, ticket lines, and total.
- Payment-method rows for VA, QRIS, and GoPay.
- Method-specific VA/QRIS/GoPay instruction panels, copy button, polling note, and sticky Pay bar.

Current native implementation:

- Has hold banner, timer, server-driven method list, selected-method state, total, sticky payment bar, and refresh-safe attempt resume.
- The order summary only renders `Pesanan {bookingId}` and the total; it does not render the event name, venue, or ticket line items shown in the prototype.
- The current method list does not show the prototype’s instruction panels because the intended production flow hands off to SNAP after `createAttempt`.
- Current intentionally omits service-fee/hidden-fee lines because the contract requires total == `amountMinor`. This is a deliberate contract difference from the HTML’s sample fee lines.

Diff severity: **P1 visual/content gap, with contract-driven differences called out explicitly.**

### 8. SNAP Payment — `08a-snap.html` vs native payment handoff/simulator

Prototype reference:

- Header with Back, `SNAP Payment`, and timer.
- SNAP branding and secure-gateway subtitle.
- Order Details card with merchant, order ID, item, and total.
- Bank Transfer / E-Wallet tabs.
- Bank list, VA details/instructions/copy, wallet choices, QR panel, and Confirm Payment CTA.

Current native:

- The local `/snap/[bookingId]` screen is a generic simulator with `Selesaikan pembayaranmu`, a summary, and Success/Fail/Unknown actions. It is useful for payment state testing but does not visually implement `08a-snap.html`.
- `usePayment.openSnapHandoff` routes relative mock URLs to the simulator, but opens absolute URLs with `Linking.openURL` on native.
- A `/payment-webview/[bookingId]` route exists, but the current absolute-URL path does not route through it. Unless the real integration layer wraps this elsewhere, the native app may open an external handler rather than the intended in-app WebView.

Required follow-up:

- Decide whether `08a-snap.html` is only a prototype of the third-party page or must be reproduced by the local simulator.
- Verify the O2 page-token/WebView contract before changing the handoff. Do not collect payment instruments in the FE.
- If the in-app WebView is required, make the native composition route explicit and verify callback/result navigation on device.

### 9. My Tickets — `04-my-tickets.html` vs `HistoryScreen`

Prototype reference:

- Header and two tabs: Upcoming / Past.
- Upcoming ticket cards with event image, date/status, venue, ticket metadata, QR button, and download button.
- QR modal with reveal animation.
- Past cards shown as expired/disabled.
- Fixed four-item bottom nav with Tickets selected.

Current native:

- `HistoryScreen` is explicitly an **Arsip Event** page for past/closed catalog events.
- It renders a black archive hero, `⏳ HISTORI`, and disabled `V2EventCard` event cards.
- It has no upcoming/past tabs, no ticket entity list, no QR action, no download action, no QR modal, and no ticket-specific metadata.
- `HistoryScreen` does not render `V2BottomNav`.
- `HomeScreen` routes the Tickets tab to `/my-tickets`, but no `/my-tickets` route exists. `BrowseScreen` routes its Tickets link to `/history`. This creates an inconsistent native navigation contract.

Diff severity: **P0 structural and behavioral gap.** This must be resolved before calling the native redesign complete.

### 10. Expired / Recovery — `09-expired.html` vs `ExpiredRecoveryScreen`

Prototype reference:

- Centered icon, title, reason, `What happened?` info box, bullet list, primary retry/requeue action, secondary browse action.
- White background, red-ring icon, square buttons, reduced-motion fallback.

Current native:

- Uses the same overall information hierarchy and supports reason-specific copy for payment, hold, queue, and turn expiry.
- Recovery behavior is stronger than the prototype: it checks authoritative payment state and only exposes Retry when a booking remains payable; otherwise it requeues or returns to browse.
- Current default reason is queue/session-oriented, while the prototype default is generic `Session Expired` / booking expiry.
- Current uses emoji icons and a rounded ring utility; verify whether the native icon/ring should be replaced with a consistent SVG/icon treatment.
- The screen is not wrapped in the shared `ScreenFade` in the current entry component, so the prototype’s entry transition is not represented.

Diff severity: **P1 behavior is acceptable/stronger; P2 visual and default-state differences.**

### 11. Success — `10-success.html` vs `SuccessScreen`

Prototype reference:

- Dark background, green success icon, success title/subtitle, summary card, e-ticket card with QR and ticket code, Download/Home actions, email note.

Current native:

- Same overall dark/green/white hierarchy.
- Uses a real QR component and renders one e-ticket per ticket instead of one hard-coded sample ticket.
- Masks buyer NIK and does not expose raw NIK, which is required by the security rules.
- Adds authoritative payment re-verification and a processing state before showing the ticket; this is intentional and should remain.
- Copy is Bahasa Indonesia and the action labels differ from the English prototype.
- Verify the native share/download affordance on iOS, especially the final share sheet and print/download fallback; this is a behavior check, not a visual-only check.

Diff severity: **P2 visual/copy; behavior is mostly ahead of the prototype.**

## Priority backlog

### P0 — resolve before native redesign sign-off

- Define the canonical My Tickets model/screen. Decide whether `/history` remains archive-only and add real `/my-tickets` and `/profile` routes, or change the native bottom-nav contract to match the available routes. Correct the inconsistent Home/Browse Tickets targets.
- Implement or explicitly defer the prototype’s upcoming/past ticket tabs, QR viewer, download/share action, and ticket-specific card data.
- Resolve the `03-checkout` versus `07-ticket-selection` prototype mapping with Product/FE lead; do not combine both layouts without a decision, and do not implement `03-checkout` card-entry fields because SNAP owns payment instruments.
- Decide whether `01-home.html` and `05-browse.html` are canonical mobile compositions. If yes, remove/replace the native Home carousel and add Browse search/wishlist; if not, record the approved native deviations so visual QA does not treat them as accidental gaps.

### P1 — fix during native redesign implementation

- Replace generic mobile header actions with screen-specific chrome: Home Search/Notifications, Browse Wishlist/Search, My Tickets action, Event Detail Back/Share.
- Fix Waiting Room safe-area top padding; the current logo overlaps the Dynamic Island in the observed iPhone screenshot.
- Align mobile semantic spacing with the prototype (`l=32`, `xl=48`) or document a deliberate native spacing scale. Recheck Home hero height (`70vh`), Home section background/stats/footer composition, Event Detail section spacing, and Waiting dimensions after the token decision.
- Fix Waiting visual dimensions: 20px logo, 24px event title, 200px ring, 6px stroke, and prototype vertical gaps, unless the larger native values are explicitly approved.
- Bundle/load JetBrains Mono for queue and timer surfaces or change the font token to the approved native equivalent.
- Decide and verify the native SNAP handoff path. Confirm whether absolute redirects should enter the in-app WebView route instead of `Linking.openURL`.
- Expand Payment order summary if the prototype content is required: event name, venue, ticket lines, and method instructions/status.
- Make the Browse search field, fixed category bar, card wishlist affordance, and header wishlist count match the prototype, or document each as deferred. Remove or implement native-only sort/load-more controls.
- Verify Home primary/ghost CTA contrast and visibility at the native viewport.
- Add the Success e-ticket detail fields from the mobile prototype, or document the reduced security-safe ticket card as the approved native variant. Align the success icon ring treatment if visual parity is required.
- Replace action-like `Text` nodes on Expired with explicit accessible pressable controls and verify 44px hit targets.

### P2 — polish after structure is correct

- Replace emoji symbols with consistent SVG/native icons where the prototype uses SVG.
- Verify crisp hard shadows on iOS and Android; elevation is not a faithful iOS equivalent.
- Normalize copy language and typography decisions.
- Tune animation timing/staging: loader wipe, header slide, card cascade/intersection timing, hero settle/parallax, wishlist heart pop, lineup pop, CTA pulse, QR reveal, and reduced-motion behavior.
- Run fixed-fixture screenshot comparisons so data changes do not obscure layout regressions.

## Suggested native QA matrix

| Area | Native check |
|---|---|
| Safe area | iPhone Dynamic Island, iPhone home indicator, Android cutout/navigation bar |
| Navigation | Home → Browse → Tickets → Profile; Event Detail → Queue → Checkout → Payment → Result |
| Timer | Background/foreground, refresh, server offset, warning threshold, expiry route |
| Queue | Normal, possible, guaranteed, not-enough, your-turn redirect, sold out, offline, leave modal |
| Browse | Category filter, list/grid, sort, wishlist, card press, load-more behavior |
| Checkout | Guest consent, buyer/attendee fields, category selection, NIK validation, add/remove ticket, leave modal |
| Payment | Method selection, retry/resume, SNAP handoff, WebView callback, failed/unknown/paid verification |
| My Tickets | Upcoming/past tabs, QR open/close, share/download, empty/loading/error states |
| Motion | Reduced-motion setting disables non-essential motion without blocking state updates |
| Accessibility | Labels, focus/back behavior, live timer/queue announcements, 44px touch targets, status icon + text + color |

## Bottom line

The native redesign is not starting from zero: the main V2 visual system and the core booking-path surfaces are already present. The work should focus first on route/screen identity and native-specific chrome, especially My Tickets/Profile navigation, Browse, SNAP handoff, checkout ownership, and safe-area handling. Only after those structural gaps are resolved should animation timing, icon fidelity, shadow rendering, and copy wrapping be tuned against pixel-level screenshots.

## Implementation update — RBT-085

The P0/P1/P2 parity pass was implemented on `feature/RBT-085-native-prototype-parity`.

Resolved in code:

- Added native `/my-tickets` and `/profile` routes with mobile bottom-navigation wiring.
- Added My Tickets Upcoming/Past tabs, search affordance, ticket detail/QR modal, share affordance, and empty state.
- Added screen-specific Home Search/Notifications actions and Browse Wishlist/search/card-heart controls.
- Changed Home native hero to the static mobile composition, added the prototype three-stat banner, and removed native-only archive/footer content from the mobile composition.
- Aligned mobile spacing tokens, hero height, Waiting Room ring/title dimensions, and Waiting Room safe-area header padding.
- Added the native SNAP method-selection surface (Bank Transfer/E-Wallet, bank/VA details, wallet choices) while preserving the payment-instrument boundary.
- Routed native absolute payment handoffs through the in-app payment-webview route when a booking context is available.
- Matched mobile Event Detail content visibility and enhanced Success ticket cards with event, attendee, venue, date, and masked-NIK details.
- Converted Expired recovery actions to explicit accessible pressable controls.

Remaining intentional or contract-dependent differences:

- The live backend ticket list/download contract is not present in the current FE ports, so My Tickets currently derives the active session ticket and uses a safe empty state rather than inventing a repository contract.
- Real SNAP page-token/WebView behavior remains dependent on the O2 payment contract; the local simulator remains available for state testing.
- `03-checkout.html` remains a legacy/mapping conflict because its card-entry fields violate the locked SNAP payment boundary; `/checkout` follows the ticket-selection flow.
- Pixel-perfect SVG icon, hard-shadow, JetBrains Mono bundling, loader-wipe, and scroll-triggered animation tuning remain P2 polish items.

Verification after implementation:

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test -- --runInBand --forceExit --silent` — 103 suites passed, 804 tests passed.
- `npx expo export --platform web` — passed; 29 static routes exported, including `/my-tickets`, `/profile`, and `/payment-webview/[bookingId]`.

## RBT-109 native recapture update — 2026-11-04

This section supersedes any earlier statement that the screens below are fully parity-verified. The native simulator was recaptured after the latest changes; the rendered local prototype could not be opened because the browser policy denied local HTML access. Prototype source was reviewed, but rendered side-by-side approval is still outstanding. Full details and captures are in `.genesis/evidence/RBT-109/parity-report.md`.

- **Home:** the native CTA contrast defect is fixed; latest capture shows a solid black button with white text. Full hero height, motion, and below-fold sections remain unverified against a rendered reference.
- **Browse:** the native-only black hero is removed. Fixed search and category bars now follow the prototype layout; results have a 16px frame and 36px grid/list controls. The latest capture still shows a card-level wishlist placement defect. Search/filter/press states need follow-up.
- **Event Detail:** native category border frame, dividers, padding, and price/status alignment are fixed and recaptured. Live category fixtures differ from the HTML sample; gallery, modal, and full scroll states remain unverified.
- **Waiting Room:** the test route produced “No Active Queue”; it did not provide evidence for normal queue or turn states.
- **Checkout / Payment:** ticket-selection form and payment screen are recaptured. Payment sticky-bar composition remains visibly different from the prototype. The legacy card-entry prototype remains excluded by the SNAP ownership rule.
- **SNAP:** top safe-area overlap is fixed; header and centered SNAP identity now follow the mobile reference. The simulator still differs in payment-method/confirmation composition. Its countdown is omitted because it has no server-authoritative expiry value.
- **My Tickets / Success:** only the empty ticket state and unverified-payment loading state were available. Populated ticket/QR and paid-success states are not signed off.
- **Expired:** recovery state was recaptured; detailed icon/action parity and interaction states remain open.
- **Profile:** app-only route; no matching screen exists in `v2-mobile`.

Verification for RBT-109: `npm run typecheck` and `npm run lint` pass; 5 targeted suites / 29 tests pass. The pass remains in progress and is not ready for G3 evidence approval or PR. Android was not captured. No backend state or payment instrument behavior was fabricated.

### Payment Result cold-start recovery

A cold launch of `/payment-result/demo-booking` without an `attemptId` reproduced an indefinite spinner: `useVerifyPayment` disables its query when the id is missing, but the screen previously rendered the normal verifying state. The screen now reports the missing attempt and offers `Kembali ke pembayaran`; that page provides the existing route back Home. Evidence: `.genesis/evidence/RBT-109/after/payment-result-missing-attempt.png`. Typecheck/lint pass and the Payment Result screen suite passes 6 tests, including the new recovery action. This is a native route defect, separate from the prototype parity gaps above.
