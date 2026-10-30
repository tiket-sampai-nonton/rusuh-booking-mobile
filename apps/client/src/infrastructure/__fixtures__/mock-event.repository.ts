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
import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";

// RBT-014: the mock now serves the shared contract-shaped fixture set
// (≥5 events incl. SOLD_OUT / NOT_STARTED / CLOSED), replacing the earlier
// minimal inline seed. The fixtures live in src/shared/test-fixtures so tests
// and the mock adapter share one source.
const SEED: readonly EventDetail[] = EVENT_FIXTURES;

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
