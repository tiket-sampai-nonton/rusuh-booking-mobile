// SNAP URLs contain a payment token. Keep the URL only in memory and never in
// navigation parameters, persistent storage, or logs.
export type PaymentReturnUrls = {
  successReturnUrl?: string;
  failedReturnUrl?: string;
};
let pending:
  | { bookingId: string; url: string; returns?: PaymentReturnUrls }
  | undefined;

export function setPaymentHandoff(
  bookingId: string,
  url: string,
  returns?: PaymentReturnUrls,
): void {
  const target = new URL(url);
  if (
    target.protocol !== "https:" ||
    !["app.midtrans.com", "app.sandbox.midtrans.com"].includes(
      target.hostname,
    ) ||
    target.username ||
    target.password ||
    target.port
  ) {
    throw new Error("Invalid payment gateway URL");
  }
  pending = { bookingId, url: target.toString(), returns };
}

export function getPaymentHandoff(bookingId: string): typeof pending {
  return pending?.bookingId === bookingId ? pending : undefined;
}

export function clearPaymentHandoff(bookingId: string): void {
  if (pending?.bookingId === bookingId) pending = undefined;
}
