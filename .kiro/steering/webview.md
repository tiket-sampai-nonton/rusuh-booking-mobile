---
inclusion: always
---

# Payment web view rules

- The payment page is the only embedded web content. Other screens use Compose Multiplatform.
- Load only the application payment origin. Open external wallet links using each platform's external link handler. Validate all bridge messages before acting on them.
- Disable local file access and mixed content where supported. Enable web debugging only in debug builds.
- Back navigation follows booking state: editable orders return to Ticket Detail; locked orders show the server-provided payment deadline. Closing the payment view does not cancel a booking.
- Verify final payment results through `GET /api/v1/bookings/{bookingId}`.
