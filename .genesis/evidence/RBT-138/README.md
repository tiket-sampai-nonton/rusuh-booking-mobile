# RBT-138 verification evidence

**Run date:** 2026-11-12

**Build:** Expo static web export with the development mock catalog

**Audit:** Lighthouse 13.6.0, local static server on port 4173

## Home Lighthouse

| Profile | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 92 | 100 | 100 | 100 | 2.8 s | 110 ms | 0 |
| Desktop | 90 | 100 | 100 | 100 | 1.3 s | 10 ms | 0 |

Screenshots: [mobile](./lighthouse-home-mobile.jpg), [desktop](./lighthouse-home-desktop.jpg).

## Browse Lighthouse

Mobile scores: Performance **75**, Accessibility 100, Best Practices 100, SEO 100; LCP 4.8 s, TBT 130 ms, CLS 0. The user asked to defer further Browse performance work and proceed with the commit/merge, so this score remains below the Lighthouse green threshold.

## Other verification

- `npm run typecheck` — passed.
- `npm run lint` — passed with existing warnings and no errors.
- `npx expo export --platform web` — passed.
- `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npm run web:verify` — passed.

Lighthouse commands used:

```sh
npx --yes lighthouse@13.6.0 http://127.0.0.1:4173 \
  --chrome-path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --chrome-flags='--headless=new --no-sandbox' \
  --only-categories=performance,accessibility,best-practices,seo

npx --yes lighthouse@13.6.0 http://127.0.0.1:4173 \
  --chrome-path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --chrome-flags='--headless=new --no-sandbox' --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo
```
