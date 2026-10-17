# rusuh-booking-mobile

Aplikasi mobile **Rusuh Booking Tiket** (React Native + Expo). Pembayaran memakai payment page web lewat WebView.
Disusun oleh Tim PT. Tiket Sampai Nonton Sentosa.

> Status: **skeleton**. Layar utama, layar bayar WebView dengan aturan keamanan dan validasi bridge, config, test, CI, dan workflow rilis APK sudah disiapkan.

## Mulai

```bash
corepack enable
pnpm install            # pertama kali: commit pnpm-lock.yaml
npx expo install --fix  # selaraskan versi paket dengan SDK Expo
cp .env.example .env
pnpm android            # emulator/device Android
pnpm lint && pnpm typecheck && pnpm test
```

Emulator Android mengakses host lewat `10.0.2.2` (BE :8080, web :3000).

## Rilis APK

Push tag `v0.1.0` → workflow `release-android` membangun APK (varian `staging`) dan mengunggahnya ke GitHub Releases.
Isi repository variables `STAGING_API_BASE_URL` dan `STAGING_WEB_BASE_URL` dulu.

## Dokumen

Lihat `docs/README.md`.
