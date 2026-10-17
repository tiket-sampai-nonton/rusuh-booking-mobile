---
inclusion: fileMatch
fileMatchPattern: "{app/pay,src/features/payment}/**"
---

# Aturan WebView (SDD)

- Hanya origin aplikasi dimuat; lainnya dibuka eksternal. Deeplink `gojek://`, `shopeeid://`, `intent://` → `Linking.openURL`.
- `onMessage` hanya dari origin aplikasi; payload divalidasi (`parseBridgeMessage`).
- File access, universal file access, mixed content dimatikan; debugging WebView hanya build debug.
- Back: pesanan bisa diubah → tutup WebView, buka detail mode ubah. Terkunci → dialog "Pesanan Anda menunggu pembayaran hingga mm:ss". Menutup WebView tidak membatalkan booking.
- Hasil akhir selalu dari `GET /api/v1/bookings/{bookingId}`.
