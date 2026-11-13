import type {
  Booking,
  BookingRepository,
} from "@domain/repositories/booking.repository";

/** Requests the BE's payment-aware cancellation for an unpaid booking. */
export class CancelBooking {
  constructor(private readonly bookings: BookingRepository) {}

  execute(bookingId: string): Promise<Booking> {
    if (!this.bookings.cancelBooking) {
      return Promise.reject(new Error("Pembatalan booking tidak tersedia."));
    }
    return this.bookings.cancelBooking(bookingId);
  }
}
