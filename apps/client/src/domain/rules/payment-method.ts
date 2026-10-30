/**
 * Payment-method display rules — pure domain (framework-free).
 *
 * The method buckets the FE offers (D10.1: VA BCA/BNI/BRI/Permata · QRIS ·
 * GoPay — NO credit card, SNAP owns the instrument). Labels mirror the
 * prototype `payment.html`. The authoritative set would come from the server
 * `page.methods`; until the BE payment-page contract (O2) lands we offer the
 * full contract enum (PaymentMethod).
 */
import type { PaymentMethod } from "@domain/repositories/payment.repository";

export interface MethodMeta {
  readonly code: PaymentMethod;
  readonly icon: string;
  readonly name: string;
  readonly sub: string;
}

/** Ordered method metadata (prototype payment.html `methodLabels`). */
export const PAYMENT_METHODS: readonly MethodMeta[] = [
  { code: "VA_BCA", icon: "BCA", name: "Virtual Account BCA", sub: "Transfer via ATM / m-banking BCA" },
  { code: "VA_BNI", icon: "BNI", name: "Virtual Account BNI", sub: "Transfer via ATM / m-banking BNI" },
  { code: "VA_BRI", icon: "BRI", name: "Virtual Account BRI", sub: "Transfer via ATM / m-banking BRI" },
  { code: "VA_PERMATA", icon: "PRM", name: "Virtual Account Permata", sub: "Transfer via ATM / m-banking Permata" },
  { code: "QRIS", icon: "QR", name: "QRIS", sub: "Scan dari semua e-wallet & m-banking" },
  { code: "GOPAY", icon: "GP", name: "GoPay", sub: "Bayar via aplikasi Gojek" },
];

/** Look up a method's metadata (falls back to a generic label defensively). */
export function methodMeta(code: PaymentMethod): MethodMeta {
  return (
    PAYMENT_METHODS.find((m) => m.code === code) ?? {
      code,
      icon: "?",
      name: code,
      sub: "",
    }
  );
}
