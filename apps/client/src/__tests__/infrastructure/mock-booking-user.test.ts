import { MockBookingRepository } from "@infrastructure/__fixtures__/mock-booking.repository";
import { MockUserRepository } from "@infrastructure/__fixtures__/mock-user.repository";

describe("MockBookingRepository", () => {
  it("creates + restores a session and holds idempotently", async () => {
    const repo = new MockBookingRepository();
    expect(await repo.getCurrentSession()).toBeNull();

    const session = await repo.createSession("evt-1");
    expect(session.eventId).toBe("evt-1");
    expect(await repo.getCurrentSession()).toEqual(session);

    const check = await repo.checkAttendee(
      session.sessionId,
      "3201234567890001",
    );
    expect(check.result).toBe("AVAILABLE");
    expect(check.nikMasked).toMatch(/\*\*\*\*/);

    // Deterministic verdicts by NIK suffix (RBT-052 AC2).
    const blocked = await repo.checkAttendee(
      session.sessionId,
      "3201234567890100",
    );
    expect(blocked.result).toBe("ALREADY_REGISTERED");
    const limited = await repo.checkAttendee(
      session.sessionId,
      "3201234567890199",
    );
    expect(limited.result).toBe("CHECK_LIMIT_REACHED");
    expect(limited.checksRemaining).toBe(0);

    // setBuyer records the MASKED NIK only (SECURITY — never the raw NIK).
    expect(repo.getBuyerSet()).toBeNull();
    await repo.setBuyer(
      session.sessionId,
      "3171999999999999",
      "buyer@mail.com",
    );
    const set = repo.getBuyerSet();
    expect(set?.email).toBe("buyer@mail.com");
    expect(set?.nikMasked).toBe("31****99");
    expect(set?.nikMasked).not.toContain("3171999999999999"); // no raw NIK

    const items = [
      { categoryId: "REG", attendeeName: "A", attendeeNik: "3171010101010001" },
    ];
    const b1 = await repo.hold(session.sessionId, items, "idem-1");
    const b2 = await repo.hold(session.sessionId, items, "idem-1");
    expect(b2.bookingId).toBe(b1.bookingId); // idempotent
    const b3 = await repo.hold(session.sessionId, items, "idem-2");
    expect(b3.bookingId).not.toBe(b1.bookingId);
  });

  it("hold throws deterministic domain conflicts (RBT-054, FR-16)", async () => {
    const repo = new MockBookingRepository();
    const s = await repo.createSession("evt-1");
    const base = { attendeeName: "A", attendeeNik: "3171010101010001" };

    await expect(
      repo.hold(s.sessionId, [{ ...base, categoryId: "SOLD" }], "k1"),
    ).rejects.toMatchObject({ code: "CATEGORY_UNAVAILABLE" });

    await expect(
      repo.hold(
        s.sessionId,
        [
          { ...base, categoryId: "REG" },
          {
            categoryId: "VIP",
            attendeeName: "B",
            attendeeNik: "3171010101010002",
          },
        ],
        "k2",
      ),
    ).rejects.toMatchObject({ code: "MIXED_CATEGORIES_NOT_ALLOWED" });

    await expect(
      repo.hold(
        s.sessionId,
        [
          {
            categoryId: "REG",
            attendeeName: "A",
            attendeeNik: "3171010101010001",
          },
          {
            categoryId: "REG",
            attendeeName: "B",
            attendeeNik: "3171010101010001",
          },
        ],
        "k3",
      ),
    ).rejects.toMatchObject({ code: "ATTENDEE_NIK_DUPLICATE_IN_ORDER" });

    const four = [1, 2, 3, 4].map((n) => ({
      categoryId: "REG",
      attendeeName: `A${n}`,
      attendeeNik: `317101010101000${n}`,
    }));
    await expect(repo.hold(s.sessionId, four, "k4")).rejects.toMatchObject({
      code: "QUANTITY_EXCEEDS_LIMIT",
    });
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
    await expect(repo.verifyOtp("a@b.com", "000000")).rejects.toThrow(
      /invalid OTP/,
    );
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
