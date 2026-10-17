---
inclusion: always
---

# Product — Rusuh Booking Tiket

- Alur: Home → Waiting Room → Detail Ticket → Payment, untuk web dan mobile.
- Klien: PT. Tiga Sekawan Angin Ribut. Penyusun: Tim PT. Tiket Sampai Nonton Sentosa.
- Prinsip: (1) jaga pengalaman pengguna apa pun kondisi backend; (2) **Jangan PHP**: pembeli yang sudah masuk detail dijamin ada tiket untuknya.
- Server adalah sumber kebenaran: posisi antrean, timer, kuota, dan status pembayaran. UI hanya menampilkan; angka aturan (TTL, batas tiket, interval polling) datang dari konfigurasi server, tidak di-hard-code.
- Dokumen sistem (PRD, SRS, HLD, SDD, ADR, Test Plan) ada di repo BE: https://github.com/tiket-sampai-nonton/rusuh-booking-be/tree/main/docs
