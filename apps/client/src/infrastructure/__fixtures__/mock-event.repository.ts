/**
 * MockEventRepository — in-memory adapter for `EventRepository`.
 *
 * Bound by the composition root when `EXPO_PUBLIC_USE_MOCKS` is on, so the app
 * boots and the funnel is demoable before the real HTTP adapter (RBT-010)
 * exists. Framework-free; deterministic for tests.
 */
import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";

// Minimal contract-shaped seed so the app boots under mocks. RBT-014 expands
// this to the full fixture set (≥5 events incl. SOLD_OUT/NOT_STARTED/CLOSED).
const SEED: readonly EventDetail[] = [
  {
    id: "evt-1",
    slug: "rusuh-fest-2026",
    name: "Rusuh Fest 2026",
    venue: "GBK",
    startsAt: "2026-12-01T12:00:00.000Z",
    salesStartsAt: "2026-11-01T00:00:00.000Z",
    salesEndsAt: "2026-11-30T23:59:59.000Z",
    status: "AVAILABLE",
    minPriceMinor: 45000000,
    remainingTickets: 120,
  },
  {
    id: "evt-2",
    slug: "nonton-bareng-finale",
    name: "Nonton Bareng Finale",
    venue: "ICE BSD",
    startsAt: "2026-12-20T18:00:00.000Z",
    salesStartsAt: "2026-11-15T00:00:00.000Z",
    salesEndsAt: "2026-12-19T23:59:59.000Z",
    status: "AVAILABLE",
    minPriceMinor: 30000000,
    remainingTickets: 40,
  },
];

export class MockEventRepository implements EventRepository {
  async listEvents(): Promise<readonly EventSummary[]> {
    return SEED.map(({ description: _description, ...summary }) => summary);
  }

  async getEventDetail(eventId: string): Promise<EventDetail> {
    const found = SEED.find((e) => e.id === eventId);
    if (!found) {
      throw new Error(`MockEventRepository: unknown event ${eventId}`);
    }
    return found;
  }
}
