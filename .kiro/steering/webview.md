---
inclusion: always
---

# Alur pembayaran lintas platform

- Payment page web tetap bagian dari alur produk. Integrasi pembuka halaman dan komunikasi balik dipilih sesuai kemampuan Android, iOS, dan web saat implementasi Compose Multiplatform.
- Hanya origin aplikasi yang boleh dimuat dalam tampilan web tersemat dan mengirim pesan ke aplikasi. Validasi payload sebelum diproses. Tautan e-wallet dibuka melalui penangan tautan eksternal platform.
- Nonaktifkan akses file dan mixed content pada tampilan web tersemat jika platform mendukungnya; debugging hanya pada build debug.
- Kembali dari pembayaran: pesanan yang masih bisa diubah membuka detail mode ubah; pesanan terkunci menampilkan pesan "Pesanan Anda menunggu pembayaran hingga mm:ss". Menutup tampilan pembayaran tidak membatalkan booking.
- Hasil akhir selalu diverifikasi melalui `GET /api/v1/bookings/{bookingId}`.
