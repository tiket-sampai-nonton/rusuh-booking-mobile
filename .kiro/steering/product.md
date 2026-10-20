---
inclusion: always
---

# Product — Rusuh Booking Tiket

- Flow: Home → Waiting Room → Ticket Detail → Payment on Android, iOS, and web.
- Client: PT. Tiga Sekawan Angin Ribut. Prepared by PT. Tiket Sampai Nonton Sentosa.
- Preserve the user experience even when the backend is degraded. A buyer who reaches Ticket Detail must have a ticket reserved for them; do not make a false availability promise.
- The server is authoritative for queue position, timers, quotas, and payment status. The client displays server state. TTL, ticket limits, and polling intervals come from server configuration.
- Compose Multiplatform is the **client** stack. Do not infer or prescribe a backend implementation language from it.
- System documents (PRD, SRS, HLD, SDD, ADR, Test Plan) are in the backend repository: https://github.com/tiket-sampai-nonton/rusuh-booking-be/tree/main/docs
