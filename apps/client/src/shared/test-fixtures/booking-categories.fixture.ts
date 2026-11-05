import type { BookingCategory } from "@domain/repositories/booking.repository";

/** Contract-shaped mock categories used only by the mock booking adapter/tests. */
export const BOOKING_CATEGORY_FIXTURE: readonly BookingCategory[] = [
  {
    categoryId: "10000000-0000-4000-8000-000000000001",
    code: "REG",
    name: "Reguler",
    priceMinor: 45000000,
    available: 500,
  },
  {
    categoryId: "10000000-0000-4000-8000-000000000002",
    code: "VIP",
    name: "VIP",
    priceMinor: 95000000,
    available: 100,
  },
];
