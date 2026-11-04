# RBT-115 — Native checkout continue action

## Result

Reserved a minimum width for the native checkout action and prevented its label from wrapping. The action remains rendered while disabled, so checking consent changes its availability without removing it from the sticky footer.

## Visual evidence

- `before/user-reported-hidden-button.png` — supplied report showing only the total in the footer after consent was checked.
- `before/live-consent-button-visible.png` — live Android capture before the layout adjustment; the action was visible, so the reported state could not be reproduced in that build.
- `after/android-consent-checked-footer.png` — Pixel 7 Pro emulator capture after the adjustment; consent is checked and “LANJUT BAYAR” remains visible beside the total.

The supplied missing-action state was not reproducible in the current Expo session. The native footer width guard and regression assertions make the intended visibility explicit. The CTA can still be disabled by checkout validation; this change addresses visibility, not eligibility.

## Verification

- Android Pixel 7 Pro emulator: checked consent and captured the sticky footer; CTA remained visible.
- `CheckoutFragments.test.tsx` and `CheckoutScreen.flows.test.tsx`: 22 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
