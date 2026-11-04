import { HttpTicketHistoryRepository } from "@infrastructure/api/http-ticket-history.repository";
import type { HttpClient } from "@infrastructure/http/http-client";
import type { TokenStorage } from "@domain/auth/token-storage.port";

describe("HttpTicketHistoryRepository", () => {
  it("loads paginated account bookings with the stored bearer token", async () => {
    const http = {
      request: jest.fn().mockResolvedValue({
        status: 200,
        headers: {},
        data: { meta: { code: 0 }, data: { bookings: [{ bookingId: "booking-1", publicRef: "RB-1", eventName: "Rusuh Fest", status: "PAID", amountMinor: 45000000 }], nextCursor: "next-page" } },
      }),
    } as unknown as HttpClient;
    const tokenStorage = { load: jest.fn().mockResolvedValue("access-token") } as unknown as TokenStorage;
    const repository = new HttpTicketHistoryRepository(http, tokenStorage);

    await expect(repository.listMyBookings("cursor/1", 50)).resolves.toEqual({
      bookings: [{ bookingId: "booking-1", publicRef: "RB-1", eventName: "Rusuh Fest", status: "PAID", amountMinor: 45000000, createdAt: undefined }],
      nextCursor: "next-page",
    });
    expect(http.request).toHaveBeenCalledWith({
      method: "GET",
      url: "me/bookings?limit=50&cursor=cursor%2F1",
      headers: { Authorization: "Bearer access-token" },
    });
  });

  it("reads ticket QR payloads from the booking contract", async () => {
    const http = {
      request: jest.fn().mockResolvedValue({
        status: 200,
        headers: {},
        data: { meta: { code: 0 }, data: { bookingId: "booking-1", orderId: "order-1", publicRef: "RB-1", amountMinor: 45000000, ticketQuantity: 1, buyerNikMasked: "3174********0001", tickets: [{ ticketCode: "T-1", categoryCode: "VIP", attendeeName: "Ari", attendeeNikMasked: "3174********0001", qrPayload: "server-qr-payload" }] } },
      }),
    } as unknown as HttpClient;
    const tokenStorage = { load: jest.fn().mockResolvedValue("access-token") } as unknown as TokenStorage;
    const repository = new HttpTicketHistoryRepository(http, tokenStorage);

    const result = await repository.getBookingTickets("booking/1");
    expect(result.tickets[0]?.qrPayload).toBe("server-qr-payload");
    expect(http.request).toHaveBeenCalledWith({
      method: "GET",
      url: "bookings/booking%2F1/tickets",
      headers: { Authorization: "Bearer access-token" },
    });
  });
});
