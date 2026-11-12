import type {
  PageToken,
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
  PaymentStatus,
  SnapOutcome,
} from "@domain/repositories/payment.repository";
import { assertOk, unwrap } from "@infrastructure/api/envelope";
import { toPageToken } from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

type WireAttempt = {
  attemptNo: number;
  status: string;
  method?: PaymentMethod;
  expiresAt?: string;
  redirectUrl?: string;
  successReturnUrl?: string;
  failedReturnUrl?: string;
};
type WirePage = {
  bookingId: string;
  methods: PaymentMethod[];
  amountMinor: number;
  paymentExpiresAt: string;
  serverTime: string;
  currentAttempt?: WireAttempt | null;
};
type WireStatus = {
  bookingId: string;
  bookingStatus: string;
  paymentExpiresAt?: string;
  serverTime?: string;
  attempt?: WireAttempt | null;
};

function attemptStatus(status?: string): PaymentStatus {
  if (status === "FAILED" || status === "CANCELLED") return "FAILED";
  if (status === "EXPIRED") return "EXPIRED";
  return status === "CREATED" ? "READY" : "AWAITING_PAYMENT";
}

function mapAttempt(
  bookingId: string,
  wire: WireAttempt,
  serverTime?: string,
): PaymentAttempt {
  return {
    // The contract identifies an attempt by number; status reads use bookingId.
    attemptId: String(wire.attemptNo),
    bookingId,
    status: attemptStatus(wire.status),
    method: wire.method,
    redirectUrl: wire.redirectUrl,
    paymentExpiresAt: wire.expiresAt,
    serverTime,
    successReturnUrl: wire.successReturnUrl,
    failedReturnUrl: wire.failedReturnUrl,
  };
}

export class HttpPaymentRepository implements PaymentRepository {
  constructor(private readonly http: HttpClient) {}

  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    const res = await this.http.request({
      method: "GET",
      url: `payments/${encodeURIComponent(bookingId)}/page`,
    });
    const data = unwrap<WirePage>(res);
    return {
      ...data,
      currentAttempt: data.currentAttempt
        ? mapAttempt(bookingId, data.currentAttempt, data.serverTime)
        : undefined,
    };
  }

  async createAttempt(
    bookingId: string,
    method: PaymentMethod,
    idempotencyKey: string,
  ): Promise<PaymentAttempt> {
    const res = await this.http.request({
      method: "POST",
      url: `payments/${encodeURIComponent(bookingId)}/attempts`,
      headers: { "idempotency-key": idempotencyKey },
      body: { method },
    });
    return mapAttempt(bookingId, unwrap<WireAttempt>(res));
  }

  async getStatus(
    attemptId: string,
    bookingId?: string,
  ): Promise<PaymentAttempt> {
    const id = bookingId ?? attemptId;
    const res = await this.http.request({
      method: "GET",
      url: `payments/${encodeURIComponent(id)}/status`,
    });
    const data = unwrap<WireStatus>(res);
    let status: PaymentStatus;
    if (data.bookingStatus === "PAID") status = "PAID";
    else if (data.bookingStatus === "EXPIRED") status = "EXPIRED";
    else if (data.bookingStatus === "CANCELLED") status = "FAILED";
    else status = attemptStatus(data.attempt?.status);
    return {
      attemptId: data.attempt ? String(data.attempt.attemptNo) : "",
      bookingId: data.bookingId,
      status,
      method: data.attempt?.method,
      paymentExpiresAt: data.paymentExpiresAt,
      serverTime: data.serverTime,
      redirectUrl: data.attempt?.redirectUrl,
    };
  }

  async createPageToken(bookingId: string): Promise<PageToken> {
    const res = await this.http.request({
      method: "POST",
      url: `payments/${encodeURIComponent(bookingId)}/page-tokens`,
    });
    return toPageToken(unwrap<Parameters<typeof toPageToken>[0]>(res));
  }

  async exchangePageToken(pageToken: string): Promise<void> {
    const res = await this.http.request({
      method: "POST",
      url: "payment-page-sessions",
      body: { pageToken },
    });
    assertOk(res);
  }

  async snapCallback(
    _attemptId: string,
    _outcome: SnapOutcome,
  ): Promise<PaymentAttempt> {
    throw new Error("Gateway callbacks are handled by the payment service");
  }
}
