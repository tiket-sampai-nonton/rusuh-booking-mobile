/**
 * GetEventDetail use case (application layer — framework-free).
 *
 * Orchestrates the single-event read: fetch one event's detail through the
 * `EventRepository` port. The presentation hook (`useEventDetail`) is the only
 * caller; it names no repository. Mirrors `ListEvents` (RBT-030).
 *
 * No React / RN / Expo imports (ARCHITECTURE dependency rule).
 */
import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";

export class GetEventDetail {
  constructor(private readonly events: EventRepository) {}

  /**
   * Fetch one event's detail by id. Guards an empty id up front so a bad route
   * param (`/events/`) fails fast with a clear error instead of hitting the
   * repository. Any repository rejection (not-found, network) propagates to the
   * caller, which surfaces the error state.
   */
  async execute(eventId: string): Promise<EventDetail> {
    if (!eventId || eventId.trim().length === 0) {
      throw new Error("GetEventDetail: eventId is required");
    }
    return this.events.getEventDetail(eventId);
  }
}
