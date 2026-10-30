import { HttpBookingRepository } from "@infrastructure/api/http-booking.repository";
import { HttpEventRepository } from "@infrastructure/api/http-event.repository";
import { HttpPaymentRepository } from "@infrastructure/api/http-payment.repository";
import { HttpQueueRepository } from "@infrastructure/api/http-queue.repository";
import { HttpUserRepository } from "@infrastructure/api/http-user.repository";
import { TransportError } from "@infrastructure/api/envelope";
import type {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from "@infrastructure/http/http-client";

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
    const repo = new HttpEventRepository(http);
    const out = await repo.listEvents();
    expect(http.calls[0]).toEqual({ method: "GET", url: "events" });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: "e1", slug: "s1", status: "AVAILABLE" });
  });

  it("gets event detail by id (url-encoded)", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(
      ok({
        eventId: "e 2",
        slug: "s2",
        name: "N2",
        salesStartsAt: "x",
        salesEndsAt: "y",
        status: "SOLD_OUT",
        description: { longDesc: "d" },
      }),
    );
    const repo = new HttpEventRepository(http);
    const out = await repo.getEventDetail("e 2");
    expect(http.calls[0].url).toBe("events/e%202");
    expect(out.description).toEqual({ longDesc: "d" });
  });
});

describe("HttpQueueRepository", () => {
  it("joins, reads status, and leaves", async () => {
    const http = new FakeHttpClient();
    const entry = {
      queueId: "q1",
      eventId: "e1",
      position: 3,
      status: "WAITING",
    };
    http.queueResponse(ok(entry));
    http.queueResponse(ok({ ...entry, position: 2 }));
    http.queueResponse({ status: 204, headers: {}, data: null });
    const repo = new HttpQueueRepository(http);

    const joined = await repo.join("e1");
    expect(http.calls[0]).toMatchObject({ method: "POST", url: "queue" });
    expect(joined.position).toBe(3);

    const status = await repo.getStatus("q1");
    expect(status.position).toBe(2);

    await expect(repo.leave("q1")).resolves.toBeUndefined();
    expect(http.calls[2]).toMatchObject({ method: "DELETE", url: "queue/q1" });
  });
});

describe("HttpPaymentRepository", () => {
  it("creates an attempt forwarding the idempotency key as a header", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(
      ok({ attemptId: "a1", bookingId: "b1", status: "AWAITING_PAYMENT" }),
    );
    const repo = new HttpPaymentRepository(http);
    const out = await repo.createAttempt("b1", "QRIS", "idem-1");
    expect(http.calls[0].headers).toMatchObject({ "idempotency-key": "idem-1" });
    expect(http.calls[0].body).toEqual({ method: "QRIS" });
    expect(out.attemptId).toBe("a1");
  });

  it("reads attempt status", async () => {
    const http = new FakeHttpClient();
    http.queueResponse(ok({ attemptId: "a1", bookingId: "b1", status: "PAID" }));
    const repo = new HttpPaymentRepository(http);
    expect((await repo.getStatus("a1")).status).toBe("PAID");
  });
});

describe("HttpBookingRepository", () => {
  it("creates + restores a session, checks attendee, holds (idempotent header)", async () => {
    const http = new FakeHttpClient();
    const session = {
      sessionId: "s1",
      eventId: "e1",
      expiresAt: "2026-01-01T00:05:00Z",
    };
    http.queueResponse(ok(session));
    http.queueResponse(ok(session));
    http.queueResponse(ok({ nikMasked: "32****89", result: "AVAILABLE" }));
    http.queueResponse(
      ok({ bookingId: "b1", sessionId: "s1", status: "HELD", amountMinor: 5 }),
    );
    const repo = new HttpBookingRepository(http);

    expect((await repo.createSession("e1")).sessionId).toBe("s1");
    expect((await repo.getCurrentSession())?.sessionId).toBe("s1");
    expect((await repo.checkAttendee("s1", "x")).result).toBe("AVAILABLE");
    const booking = await repo.hold(
      "s1",
      [{ categoryId: "c1", attendeeName: "A", attendeeNik: "n" }],
      "idem-9",
    );
    expect(booking.bookingId).toBe("b1");
    const holdCall = http.calls[3];
    expect(holdCall.headers).toMatchObject({ "idempotency-key": "idem-9" });
  });

  it("returns null for current session on a 404 status", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({ status: 404, headers: {}, data: null });
    const repo = new HttpBookingRepository(http);
    expect(await repo.getCurrentSession()).toBeNull();
  });

  it("returns null when the 404 arrives as an error envelope", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({
      status: 404,
      headers: {},
      data: { meta: { code: 1404 }, data: null },
    });
    const repo = new HttpBookingRepository(http);
    expect(await repo.getCurrentSession()).toBeNull();
  });

  it("re-throws a non-404 transport error from current session", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({
      status: 500,
      headers: {},
      data: { meta: { code: 1500 }, data: null },
    });
    const repo = new HttpBookingRepository(http);
    await expect(repo.getCurrentSession()).rejects.toBeInstanceOf(TransportError);
  });

  it("re-throws a non-TransportError (malformed 200) from current session", async () => {
    const http = new FakeHttpClient();
    // 200 but not an envelope → unwrap throws a TransportError with httpStatus 200,
    // which is NOT 404, so it must propagate (covers the non-404 guard branch).
    http.queueResponse({ status: 200, headers: {}, data: { nope: true } });
    const repo = new HttpBookingRepository(http);
    await expect(repo.getCurrentSession()).rejects.toThrow();
  });
});

describe("HttpUserRepository", () => {
  it("requests OTP, verifies, completes registration, reads profile", async () => {
    const http = new FakeHttpClient();
    http.queueResponse({ status: 204, headers: {}, data: null }); // requestOtp
    http.queueResponse(ok({ token: "t1", isNew: true })); // verify
    http.queueResponse(
      ok({ emailMasked: "a***@x.io", fullName: "A", nikMasked: "32****89", hasNik: true }),
    ); // register
    http.queueResponse(ok({ emailMasked: "a***@x.io", hasNik: true })); // me
    const repo = new HttpUserRepository(http);

    await expect(repo.requestOtp("a@x.io")).resolves.toBeUndefined();
    expect(http.calls[0]).toMatchObject({ method: "POST", url: "auth/otp/request" });

    const sess = await repo.verifyOtp("a@x.io", "123456");
    expect(sess).toEqual({ token: "t1", isNew: true });

    const prof = await repo.completeRegistration({ fullName: "A", nik: "n" });
    expect(prof.hasNik).toBe(true);
    expect(http.calls[2]).toMatchObject({ method: "PATCH", url: "me" });

    expect((await repo.getMe()).emailMasked).toBe("a***@x.io");
  });
});
