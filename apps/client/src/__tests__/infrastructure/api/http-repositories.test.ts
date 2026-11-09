import { HttpBookingRepository } from "@infrastructure/api/http-booking.repository";
import { HttpEventRepository } from "@infrastructure/api/http-event.repository";
import { HttpPaymentRepository } from "@infrastructure/api/http-payment.repository";
import { HttpQueueRepository } from "@infrastructure/api/http-queue.repository";
import { HttpUserRepository } from "@infrastructure/api/http-user.repository";
import { ServerClock } from "@domain/services/server-clock";
import { BOOKING_CATEGORY_FIXTURE } from "@shared/test-fixtures/booking-categories.fixture";
import { TransportError } from "@infrastructure/api/envelope";
import type {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from "@infrastructure/http/http-client";
import type { TokenStorage } from "@domain/auth/token-storage.port";

/** Programmable fake transport: records requests, returns queued responses. */
class FakeHttpClient implements HttpClient {
  readonly calls: HttpRequest[] = [];
  private queue: HttpResponse<unknown>[] = [];

  queueResponse(r: HttpResponse<unknown>): void {
    this.queue.push(r);
  }
  async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
    this.calls.push(req);
    const next = this.queue.shift();
    if (!next) throw new Error("FakeHttpClient: no queued response");
    return next as HttpResponse<T>;
  }
}

const ok = <T>(data: T): HttpResponse<unknown> => ({
  status: 200,
  headers: {},
  data: { meta: { code: 200 }, data },
});

describe("HttpEventRepository", () => {
  it("lists events (unwrap + map DTO→domain)", async () => {
    const http = new FakeHttpClient();
    const serverClock = new ServerClock({
      now: () => Date.parse("2030-01-01T00:00:00Z"),
    });
    http.queueResponse(
      ok({
        events: [
          {
            eventId: "e1",
            slug: "s1",
            name: "N1",
            salesStartsAt: "2026-01-01T00:00:00Z",
            salesEndsAt: "2026-02-01T00:00:00Z",
            status: "AVAILABLE",
            minPriceMinor: 1000,
          },
        ],
        serverTime: "2026-01-01T00:00:00Z",
      }),
    );
    const repo = new HttpEventRepository(http, serverClock);
    const out = await repo.listEvents();
    expect(http.calls[0]).toEqual({ method: "GET", url: "events" });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: "e1", slug: "s1", status: "AVAILABLE" });
    expect(serverClock.serverNow()).toBe(Date.parse("2026-01-01T00:00:00Z"));
  });

  it("gets event detail by id (url-encoded)", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(
      ok({
        event: {
          eventId: "e 2",
          slug: "s2",
          name: "N2",
          salesStartsAt: "x",
          salesEndsAt: "y",
          status: "SOLD_OUT",
          bannerUrl: "https://example.com/banner.jpg",
        },
        maxTicketsPerOrder: 4,
        maxTicketsPerBuyerNik: 2,
        allowMixedCategories: false,
        published: true,
        categories: [
          {
            categoryId: "c1",
            code: "REG",
            name: "Regular",
            priceMinor: 1000,
            available: 2,
          },
        ],
      }),
    );
    const repo = new HttpEventRepository(
      http,
      new ServerClock({ now: () => Date.parse("2030-01-01T00:00:00Z") }),
    );
    const out = await repo.getEventDetail("e 2");
    expect(http.calls[0].url).toBe("events/e%202");
    expect(out).toMatchObject({
      id: "e 2",
      bannerUrl: "https://example.com/banner.jpg",
      maxTicketsPerOrder: 4,
      maxTicketsPerBuyerNik: 2,
      allowMixedCategories: false,
      published: true,
      description: {
        bannerImage: "https://example.com/banner.jpg",
        categories: [{ code: "REG", available: 2 }],
      },
    });
  });
});

describe("HttpQueueRepository", () => {
  it("joins, reads status, and leaves", async () => {
    const http = new FakeHttpClient();
    const entry = {
      entryId: "q1",
      rank: 3,
      status: "WAITING",
    };
    http.queueResponse(ok(entry));
    http.queueResponse(ok({ ...entry, exactPosition: 2 }));
    http.queueResponse({
      status: 200,
      headers: {},
      data: {
        meta: { code: 200 },
        data: { admissionRatePerMin: 875, nextPollAfterMs: 2400 },
      },
    });
    http.queueResponse({ status: 204, headers: {}, data: null });
    const repo = new HttpQueueRepository(http);

    const joined = await repo.join("e1");
    expect(http.calls[0]).toMatchObject({
      method: "POST",
      url: "events/e1/queue-entries",
    });
    expect(Number.isNaN(joined.position)).toBe(true);

    const status = await repo.getStatus("q1", "e1");
    expect(status.position).toBe(2);

    const queueStatus = await repo.getQueueStatus("event 1");
    expect(http.calls[2]).toMatchObject({
      method: "GET",
      url: "queue-status/event%201",
    });
    expect(queueStatus.admissionRatePerMin).toBe(875);
    expect(queueStatus.nextPollAfterMs).toBe(2400);

    await expect(repo.leave("q1", "e1")).resolves.toBeUndefined();
    expect(http.calls[3]).toMatchObject({
      method: "DELETE",
      url: "queue-entries/q1?eventId=e1",
    });
  });
});

describe("HttpPaymentRepository", () => {
  it("GETs the payment page and maps it (RBT-060)", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(
      ok({
        bookingId: "b1",
        methods: ["VA_BCA", "QRIS"],
        amountMinor: 45000000,
        paymentExpiresAt: "2026-01-01T00:10:00Z",
        serverTime: "2026-01-01T00:00:00Z",
      }),
    );
    const repo = new HttpPaymentRepository(http);
    const page = await repo.getPaymentPage("b1");
    expect(http.calls[0]).toMatchObject({
      method: "GET",
      url: "payments/b1/page",
    });
    expect(page.methods).toEqual(["VA_BCA", "QRIS"]);
    expect(page.amountMinor).toBe(45000000);
  });

  it("mints a page token and exchanges it (RBT-062)", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(
      ok({ pageToken: "pgt_1", pageUrl: "/payment/b1?rb_pay_token=pgt_1" }),
    );
    http.queueResponse({ status: 204, headers: {}, data: null });
    const repo = new HttpPaymentRepository(http);
    const token = await repo.createPageToken("b1");
    expect(http.calls[0]).toMatchObject({
      method: "POST",
      url: "payments/b1/page-tokens",
    });
    expect(token.pageToken).toBe("pgt_1");
    await repo.exchangePageToken("pgt_1");
    expect(http.calls[1]).toMatchObject({
      method: "POST",
      url: "payment-page-sessions",
      body: { pageToken: "pgt_1" },
    });
  });

  it("creates an attempt forwarding the idempotency key as a header", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(ok({ attemptNo: 1, status: "PENDING" }));
    const repo = new HttpPaymentRepository(http);
    const out = await repo.createAttempt("b1", "QRIS", "idem-1");
    expect(http.calls[0].headers).toMatchObject({
      "idempotency-key": "idem-1",
    });
    expect(http.calls[0].body).toEqual({ method: "QRIS" });
    expect(out.attemptId).toBe("1");
    expect(http.calls[0].url).toBe("payments/b1/attempts");
  });

  it("reads attempt status", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(
      ok({
        bookingId: "b1",
        bookingStatus: "PAID",
        attempt: { attemptNo: 1, status: "SUCCEEDED" },
      }),
    );
    const repo = new HttpPaymentRepository(http);
    expect((await repo.getStatus("1", "b1")).status).toBe("PAID");
  });

  it("does not expose the provider webhook as a client callback", async () => {
    const http = new FakeHttpClient();
    const repo = new HttpPaymentRepository(http);
    await expect(repo.snapCallback("a1", "PAID")).rejects.toThrow();
    expect(http.calls).toHaveLength(0);
  });
});

describe("HttpBookingRepository", () => {
  it("creates + restores a session, checks attendee, holds (idempotent header)", async () => {
    const http = new FakeHttpClient();
    const session = {
      sessionId: "s1",
      eventId: "e1",
      expiresAt: "2026-01-01T00:05:00Z",
      categories: BOOKING_CATEGORY_FIXTURE,
    };
    http.queueResponse(ok(session));
    http.queueResponse(ok(session));
    http.queueResponse(ok({ result: "AVAILABLE", checksRemaining: 5 }));
    http.queueResponse(
      ok({ bookingId: "b1", sessionId: "s1", status: "HELD", amountMinor: 5 }),
    );
    const repo = new HttpBookingRepository(http);

    expect(await repo.createSession("e1")).toMatchObject({
      sessionId: "s1",
      categories: BOOKING_CATEGORY_FIXTURE,
    });
    expect(await repo.getCurrentSession("e1")).toMatchObject({
      sessionId: "s1",
      categories: BOOKING_CATEGORY_FIXTURE,
    });
    expect(http.calls[1].url).toBe("booking-sessions/current?eventId=e1");
    const attendeeCheck = await repo.checkAttendee("s1", "x");
    expect(attendeeCheck).toMatchObject({
      result: "AVAILABLE",
      checksRemaining: 5,
    });
    expect(attendeeCheck.nikMasked).toBeUndefined();
    const booking = await repo.hold(
      "s1",
      [{ categoryId: "c1", attendeeName: "A", attendeeNik: "n" }],
      "idem-9",
      {
        nik: "n",
        email: "buyer@example.com",
        emailConfirmation: "buyer@example.com",
        consent: true,
      },
    );
    expect(booking.bookingId).toBe("b1");
    const holdCall = http.calls[3];
    expect(holdCall.headers).toMatchObject({ "idempotency-key": "idem-9" });
    expect(holdCall).toMatchObject({
      method: "POST",
      url: "bookings",
      body: {
        sessionId: "s1",
        buyer: {
          nik: "n",
          email: "buyer@example.com",
          emailConfirmation: "buyer@example.com",
          consent: true,
        },
        items: [{ categoryId: "c1", attendee: { nik: "n", fullName: "A" } }],
      },
    });
    expect(http.calls[0].body).toEqual({ admissionToken: "e1" });
  });

  it("returns null for current session on a 404 status", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({ status: 404, headers: {}, data: null });
    const repo = new HttpBookingRepository(http);
    expect(await repo.getCurrentSession("e1")).toBeNull();
  });

  it("returns null when the 404 arrives as an error envelope", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({
      status: 404,
      headers: {},
      data: { meta: { code: 1404 }, data: null },
    });
    const repo = new HttpBookingRepository(http);
    expect(await repo.getCurrentSession("e1")).toBeNull();
  });

  it("returns null when the transport rejects with a 404", async () => {
    const http = new FakeHttpClient();
    jest
      .spyOn(http, "request")
      .mockRejectedValue(new TransportError({ code: 1404, httpStatus: 404 }));
    const repo = new HttpBookingRepository(http);
    await expect(repo.getCurrentSession("e1")).resolves.toBeNull();
  });

  it("re-throws a non-404 transport error from current session", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({
      status: 500,
      headers: {},
      data: { meta: { code: 1500 }, data: null },
    });
    const repo = new HttpBookingRepository(http);
    await expect(repo.getCurrentSession("e1")).rejects.toBeInstanceOf(
      TransportError,
    );
  });

  it("re-throws a non-TransportError (malformed 200) from current session", async () => {
    const http = new FakeHttpClient();
    // 200 but not an envelope → unwrap throws a TransportError with httpStatus 200,
    // which is NOT 404, so it must propagate (covers the non-404 guard branch).
    http.queueResponse({ status: 200, headers: {}, data: { nope: true } });
    const repo = new HttpBookingRepository(http);
    await expect(repo.getCurrentSession("e1")).rejects.toThrow();
  });

  it("does not call the current-session endpoint without event context", async () => {
    const http = new FakeHttpClient();
    const repo = new HttpBookingRepository(http);
    await expect(repo.getCurrentSession()).resolves.toBeNull();
    expect(http.calls).toHaveLength(0);
  });
});

describe("HttpUserRepository", () => {
  it("requests OTP, verifies, completes registration, reads profile", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({ status: 204, headers: {}, data: null }); // requestOtp
    http.queueResponse(
      ok({
        accessToken: "t1",
        account: { emailMasked: "a***@x.io", hasNik: false },
      }),
    ); // verify
    http.queueResponse(
      ok({
        emailMasked: "a***@x.io",
        fullName: "A",
        nikMasked: "32****89",
        hasNik: true,
      }),
    ); // register
    http.queueResponse(ok({ emailMasked: "a***@x.io", hasNik: true })); // me
    const repo = new HttpUserRepository(http);

    await expect(repo.requestOtp("a@x.io")).resolves.toBeUndefined();
    expect(http.calls[0]).toMatchObject({
      method: "POST",
      url: "auth/otp/request",
    });

    const sess = await repo.verifyOtp("a@x.io", "123456");
    expect(sess).toEqual({ token: "t1", isNew: true });

    const prof = await repo.completeRegistration({ fullName: "A", nik: "n" });
    expect(prof.hasNik).toBe(true);
    expect(http.calls[2]).toMatchObject({ method: "PATCH", url: "me" });

    expect((await repo.getMe()).emailMasked).toBe("a***@x.io");
  });

  it("adds the stored bearer token to authenticated profile requests", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(ok({ emailMasked: "a***@x.io", hasNik: false }));
    const tokenStorage: TokenStorage = {
      load: jest.fn().mockResolvedValue("profile-token"),
      save: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const repo = new HttpUserRepository(http, tokenStorage);

    await repo.getMe();

    expect(http.calls[0]).toMatchObject({
      method: "GET",
      url: "me",
      headers: { Authorization: "Bearer profile-token" },
    });
  });
});
