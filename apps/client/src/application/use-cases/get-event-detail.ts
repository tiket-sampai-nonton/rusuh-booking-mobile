/**
 * GetEventDetail use case (application layer — framework-free).
 *
 * Fetches one event's detail through the `EventRepository` port. The hook
 * (`useEventDetail`) is the only caller; it names no repository.
 */
import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";

export class GetEventDetail {
  constructor(private readonly events: EventRepository) {}

  execute(eventId: string): Promise<EventDetail> {
    return this.events.getEventDetail(eventId);
  }
}
