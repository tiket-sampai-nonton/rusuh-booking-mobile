# HTML mock recreation

Recreate the seven reference pages supplied in `../V1` in the existing Android, iOS, and web Compose Multiplatform project on `cmp/mock`.

The shared UI reproduces the original Indonesian copy, Plus Jakarta Sans typography, concert photos, rounded cards, red/orange accents, dark atmospheric backgrounds, and responsive breakpoints. Home includes the carousel, event search/filtering, selling-fast cards, and footer. Event details lead to the animated waiting room, then ticket/category selection, quantity and NIK validation. Success and expiry are Compose screens.

Payment alone remains HTML in Android WebView, iOS WKWebView, and a browser iframe. Bundle and adapt the supplied payment page; its back, success, and expiry actions return to shared Compose navigation. Pass the chosen event/category/quantity/total into the payment page, rather than keeping the reference's inconsistent static order.

All queue movement, inventory, deadlines, and payment results are explicitly mock fixtures. Do not introduce backend calls or claim a real booking/payment. Keep mock behavior separate from rendering. Use deterministic stock contention for the first VIP hold so it is reproducible. Preserve the mock's quantity limit and NIK format checks without treating them as production rules. Bundle reference photos/font so the mock works without runtime asset requests. The ticket code is decorative demo data, not a usable admission credential.

Verify model behavior with common tests, compile Android/web/iOS, and inspect the web UI at desktop and mobile sizes. Document what remains simulated. User authorization is the request to recreate the supplied HTML in CMP.
