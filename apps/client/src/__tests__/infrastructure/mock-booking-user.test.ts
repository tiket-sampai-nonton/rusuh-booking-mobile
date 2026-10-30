import { MockBookingRepository } from "@infrastructure/__fixtures__/mock-booking.repository";
import { MockUserRepository } from "@infrastructure/__fixtures__/mock-user.repository";

describe("MockBookingRepository", () => {
  it("creates + restores a session and holds idempotently", async () => {
    const repo = new MockBookingRepository();
    expect(await repo.getCurrentSession()).toBeNull();

    const session = await repo.createSession("evt-1");
    expect(session.eventId).toBe("evt-1");
    expect(await repo.getCurrentSession()).toEqual(session);

    const check = await repo.checkAttendee(session.sessionId, "3201234567890001");
    expect(check.result).toBe("AVAILABLE");
    expect(check.nikMasked).toMatch(/\*\*\*\*/);

    const items = [{ categoryId: "c1", attendeeName: "A", attendeeNik: "n" }];
    const b1 = await repo.hold(session.sessionId, items, "idem-1");
    const b2 = await repo.hold(session.sessionId, items, "idem-1");
    expect(b2.bookingId).toBe(b1.bookingId); // idempotent
    const b3 = await repo.hold(session.sessionId, items, "idem-2");
    expect(b3.bookingId).not.toBe(b1.bookingId);
  });
});

describe("MockUserRepository", () => {
  it("runs the OTP → register → profile flow with demo code", async () => {
    const repo = new MockUserRepository();
    await repo.requestOtp("rizky@example.com");

    const first = await repo.verifyOtp("rizky@example.com", "123456");
    expect(first.isNew).toBe(true);

    const profile = await repo.completeRegistration({
      fullName: "Rizky",
      nik: "3201234567890001",
    });
    expect(profile.hasNik).toBe(true);
    expect(profile.nikMasked).toMatch(/\*\*\*\*/);
    expect((await repo.getMe()).fullName).toBe("Rizky");
  });

  it("rejects a wrong OTP code", async () => {
    const repo = new MockUserRepository();
    await repo.requestOtp("a@b.com");
    await expect(repo.verifyOtp("a@b.com", "000000")).rejects.toThrow(/invalid OTP/);
  });

  it("returns isNew=false for a returning user (second verify)", async () => {
    const repo = new MockUserRepository();
    await repo.requestOtp("returning@example.com");
    const first = await repo.verifyOtp("returning@example.com", "123456");
    expect(first.isNew).toBe(true);
    const second = await repo.verifyOtp("returning@example.com", "123456");
    expect(second.isNew).toBe(false); // profile already exists → isNew false branch
  });

  it("throws when reading profile before sign-in, and masks a domainless email", async () => {
    const repo = new MockUserRepository();
    await expect(repo.getMe()).rejects.toThrow(/not signed in/);
    // domainless email path in maskEmail
    await repo.requestOtp("nodomain");
    const s = await repo.verifyOtp("nodomain", "123456");
    expect(s.isNew).toBe(true);
    expect((await repo.getMe()).emailMasked).toBe("****");
  });
});
