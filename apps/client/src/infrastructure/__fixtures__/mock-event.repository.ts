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

const SEED: readonly EventDetail[] = [
  { id: "evt-1", name: "Rusuh Fest 2026", startsAt: "2026-12-01T12:00:00.000Z" },
  { id: "evt-2", name: "Nonton Bareng Finale", startsAt: "2026-12-20T18:00:00.000Z" },
];

export class MockEventRepository implements EventRepository {
  async listEvents(): Promise<readonly EventSummary[]> {
    return SEED.map(({ id, name }) => ({ id, name }));
  }

  async getEventDetail(eventId: string): Promise<EventDetail> {
    const found = SEED.find((e) => e.id === eventId);
    if (!found) {
      throw new Error(`MockEventRepository: unknown event ${eventId}`);
    }
    return found;
  }
}
