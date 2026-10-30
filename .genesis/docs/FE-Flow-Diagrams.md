# FE Flow Diagrams — Rusuh Booking Tiket

Diagram alur dari sudut pandang **Front-End (FE)** untuk disepakati bersama **Back-End (BE)**.
Semua diagram memakai **Mermaid** (render otomatis di GitHub/editor yang mendukung).

Acuan: prototype **Final** (`../prototype/Final/`, internal version "V5") + API contract (`../api-contract/`) + canonical FE-BE contract (`./FE-BE-align-contract.md`).
Catatan konvensi lintas-API (envelope `{meta,data}`, harga `*Minor`, `serverTime` untuk clock-skew,
cookie `rb_visitor` / header `X-Visitor-Token`, `Idempotency-Key`, `errorCode`) lihat
`./FE-BE-align-contract.md` §2.

**Implementasi FE yang dikunci:** Expo + React Native untuk Android/iOS dan React Native Web untuk web, dengan Clean Architecture, shared TypeScript domain/use cases, Zustand, dan platform adapters. Nama HTML di bawah adalah label logis yang dipertahankan dari prototype `Final/` (V5); pemetaan route production adalah:

```text
index.html   → /
browse.html  → /browse?genre=&province=&time=&sort=
event.html   → /events/[eventId]
waiting.html → /waiting/[eventId]
detail.html  → /checkout/[sessionId]
payment.html → /payment/[bookingId]
success.html → /success/[bookingId]?orderId={orderId}
expired.html → /expired/[resourceId]?reason=booking|payment|payment-failed
```

Isi:
1. [Screen Flow](#1-screen-flow-peta-perpindahan-halaman)
2. [Sequence Diagrams](#2-sequence-diagrams)
   - 2.1 [Login / Register (OTP)](#21-login--register-otp)
   - 2.2 [Join Queue → Waiting Room → Claim](#22-join-queue--waiting-room--claim)
   - 2.3 [Detail / Checkout (hold tiket)](#23-detail--checkout-hold-tiket)
   - 2.4 [Payment (attempt → SNAP → callback → hasil)](#24-payment-attempt--snap--callback--hasil)
   - 2.5 [Success (e-tiket)](#25-success-e-tiket)
3. [State Diagrams](#3-state-diagrams)
   - 3.1 [Booking](#31-state-booking)
   - 3.2 [Payment Attempt](#32-state-payment-attempt)
   - 3.3 [Queue Entry](#33-state-queue-entry)
4. [Polling / Timing](#4-polling--timing)

> Catatan: endpoint bertanda **(FE-NEED)** belum ada di contract saat ini (lihat daftar
> **FE NEED THIS** di `FE-BE-align-contract.md`): `POST /booking-sessions/{id}/buyer` (set-buyer),
> `JoinRequest` anonim, `remainingTickets`, `description` JSON, dsb. Di prototype di-mock.

---

## 1. Screen Flow (peta perpindahan halaman)

Perpindahan antar halaman FE beserta percabangannya (guest vs login, ada antrean vs langsung masuk,
sukses vs expired).

```mermaid
flowchart TD
  Home["index.html<br/>(Landing: Konser Terdekat + History)"]
  Filter["Filter Event<br/>(genre, provinsi, waktu, urutan)"]
  Browse["browse.html<br/>(Hasil filter berbasis URL)"]
  Login{{"Modal Masuk / Daftar<br/>(opsional, OTP)"}}
  Reg["Lengkapi profil<br/>(email baru: nama + NIK)"]
  Event["event.html<br/>(Detail Event)"]
  Waiting["waiting.html<br/>(Waiting Room)"]
  Detail["detail.html<br/>(Pilih tiket + Data Pembeli)"]
  Pay["payment.html<br/>(Pembayaran)"]
  Success["success.html<br/>(E-tiket)"]
  Expired["expired.html<br/>(booking / payment)"]

  Home -->|"klik Masuk / Daftar"| Login
  Login -->|"email lama → login"| Home
  Login -->|"email baru"| Reg
  Reg -->|"pop-up Pendaftaran Berhasil"| Home

  Home -->|"klik Filter Event"| Filter
  Filter -->|"Terapkan Filter"| Browse
  Browse -->|"hapus chip / reset / ubah filter"| Filter
  Browse -->|"pilih event"| Event
  Home -->|"pilih event"| Event
  Event -->|"Masuk Antrean (anonim)"| JoinDecision{"Perlu antre?"}
  JoinDecision -->|"WAITING (ada antrean)"| Waiting
  JoinDecision -->|"ADMITTED (slot langsung)"| Detail

  Waiting -->|"giliran tiba → auto-claim + auto-redirect"| Detail
  Waiting -->|"TURN_MISSED / SOLD_OUT"| ErrW["State error di waiting<br/>(antre lagi / cari event)"]
  Waiting -->|"Keluar antrean"| Home

  Detail -->|"Lanjut Bayar (hold OK)"| Pay
  Detail -->|"timer sesi habis (SESSION_EXPIRED)"| Expired
  Detail -->|"Kembali → dialog konfirmasi → ya"| Home

  Pay -->|"BE returns SNAP redirectUrl"| Snap["SNAP payment gateway"]
  Snap -->|"success callback"| Success
  Snap -->|"failed callback"| Failed["expired.html<br/>(payment-failed)"]
  Pay -->|"server deadline expired"| Expired

  Success -->|"Ke Beranda"| Home
  Expired -->|"Masuk Antrean Lagi"| Event
  Expired -->|"Ke Beranda"| Home
```

**Catatan percabangan:**
- **Filter V5:** Home membuka modal filter dengan genre, provinsi, waktu, dan urutan. Submit mengarah ke `browse.html` dengan query URL. Browse hanya menampilkan event mendatang, menyediakan chip filter yang dapat dihapus, reset, dan filter ulang.
- **Filter prototype-only:** V5 mengambil seluruh katalog lalu memfilter di browser karena kontrak `GET /events` belum menyediakan parameter filter. Production harus memakai field genre/lokasi terstruktur dan filter/sort server-side, atau menetapkan batas katalog dan aturan `noindex` yang jelas.
- **Waktu filter:** `Minggu ini`, `Bulan ini`, dan `3 Bulan ke depan` adalah rolling windows 7/30/90 hari dari `serverNow`, bukan batas kalender.
- **History:** Home menurunkan history dari event dengan `startsAt < serverNow` atau status `CLOSED`, diurutkan paling baru. Ini adalah fallback prototype; endpoint arsip resmi masih menjadi GAP.
- **Login opsional.** Guest bisa lanjut tanpa login; NIK + email diisi manual di `detail.html`. Jika login, data pembeli **auto-fill**.
- **Masuk Antrean bersifat anonim** (tanpa form). BE memutuskan `WAITING` atau `ADMITTED` (FR-05).
- Dari `detail.html`, tombol **Kembali** tidak langsung keluar — ada **dialog konfirmasi** (keluar = ulang antrean).

---

## 2. Sequence Diagrams

Partisipan:
- **FE** = Expo screen (React Native on Android/iOS, React Native Web on web; payment may use a native WebView)
- **Gateway** = API gateway (meneruskan ke service)
- **User Svc / Queue Svc / Booking Svc / Payment Svc** = microservice di belakang gateway
- **SNAP** = third-party payment gateway; provider callbacks are verified through BE status

### 2.1 Login / Register (OTP)

Registrasi = verify OTP pertama + lengkapi profil (nama + NIK). Email lama langsung login.

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as FE (index.html)
  participant G as Gateway
  participant US as User Service

  U->>FE: klik "Masuk / Daftar", isi email
  FE->>G: POST /auth/otp/request { email }
  G->>US: teruskan
  US-->>FE: 202 { expiresInSeconds, resendAfterSeconds }
  Note over FE,U: email dipakai juga untuk pengiriman e-tiket

  U->>FE: masukkan kode OTP (demo 123456)
  FE->>G: POST /auth/otp/verify { email, code }
  G->>US: teruskan
  US-->>FE: 200 TokenResponse { accessToken, account }

  FE->>G: GET /me
  G->>US: teruskan
  US-->>FE: 200 Profile { fullName, nikMasked, hasNik, emailMasked }

  alt profil belum lengkap (hasNik=false)  %% akun baru
    Note over FE: tampilkan form "Lengkapi Pendaftaran"<br/>email read-only + input nama + NIK
    U->>FE: isi fullName + nik (16 digit)
    FE->>G: PATCH /me { fullName, nik }
    G->>US: teruskan
    US-->>FE: 200 Profile (nikMasked, hasNik=true)
    FE-->>U: pop-up "Pendaftaran Berhasil"
  else profil sudah lengkap  %% returning user
    FE-->>U: langsung masuk (nav tampil nama)
  end
```

> **FE-NEED (lihat §6 FE-BE-align-contract):** respons `verify` belum memuat indikator "akun baru / profil belum lengkap".
> Sementara FE memakai `GET /me.hasNik` untuk memutuskan perlu-tidaknya langkah lengkapi profil.

### 2.2 Join Queue → Waiting Room → Claim

Antrean anonim; posisi real-time via polling adaptif; saat giliran tiba FE auto-claim lalu redirect.

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as FE (event.html → waiting.html)
  participant G as Gateway
  participant Q as Queue Service

  U->>FE: klik "Masuk Antrean"
  FE->>G: POST /events/{eventId}/queue-entries  %% FE-NEED: body anonim
  G->>Q: teruskan
  Q-->>FE: 201 QueueEntry { entryId, seq, status, queueToken, claimDeadline, serverTime }
  Note over FE: simpan entryId+token melalui platform persistence adapter, tahan refresh

  alt status = ADMITTED (FR-05, langsung dapat slot)
    FE->>FE: lanjut ke claim (lihat bawah)
  else status = WAITING → tampilkan waiting room
    loop polling adaptif (honor nextPollAfterMs)
      FE->>G: GET /queue-status/{eventId}
      G->>Q: teruskan
      Q-->>FE: 200 StatusDocument { servingSeq, guaranteedUntilSeq, soldOut, admissionRatePerMin, nextPollAfterMs, poll{...} }
      FE->>G: GET /queue-entries/me?eventId
      G->>Q: teruskan
      Q-->>FE: 200 EntryStatus { exactPosition, zone, status }
      Note over FE,U: tampilkan "orang di depan" + "estimasi"<br/>warna zona GUARANTEED/POSSIBLE/NOT_ENOUGH
    end
  end

  Note over FE: hanya status ADMITTED yang memberi otorisasi; posisi 0 saja belum cukup
  FE->>G: POST /queue-entries/{entryId}/claim   %% auto, tanpa tombol
  G->>Q: teruskan
  alt sukses
    Q-->>FE: 200 ClaimResponse { admissionToken (TTL 60s), bookingUrl }
    FE->>U: auto-redirect ke detail.html
  else giliran terlewat / sold out
    Q-->>FE: 410 { errorCode: TURN_MISSED | EVENT_SOLD_OUT }
    FE->>U: tampilkan state error (antre lagi / cari event)
  end
```

### 2.3 Detail / Checkout (hold tiket)

Buat sesi dari admission token, cek NIK penonton saat diketik, set data pembeli, lalu hold.

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as FE (detail.html)
  participant G as Gateway
  participant US as User Service
  participant B as Booking Service

  alt admissionToken tersedia — masuk langsung dari waiting room
    FE->>G: POST /booking-sessions { admissionToken }
    G->>B: teruskan
    B-->>FE: 201 BookingSession { sessionId, maxSelectable, allowMixedCategories, categories[], expiresAt, serverTime }
  else refresh / back — sessionId ada di URL atau storage, tanpa admissionToken
    FE->>G: GET /booking-sessions/current?eventId=
    G->>B: teruskan
    alt sesi masih valid
      B-->>FE: 200 BookingSession (expiresAt tidak di-reset, identik dengan sesi sebelumnya)
    else sesi kedaluwarsa
      B-->>FE: 410 { errorCode: SESSION_EXPIRED }
      FE->>U: redirect ke expired.html?sessionId=...&reason=booking
    end
  end
  Note over FE,U: mulai countdown dari (expiresAt - serverNow)

  opt user login (auto-fill data pembeli)
    FE->>G: GET /me
    G->>US: teruskan
    US-->>FE: 200 Profile { fullName, nikMasked, emailMasked }
    Note over FE: prefill NIK + email pembeli (badge "Terisi dari akun")
  end

  loop tiap NIK penonton selesai diketik (debounce)
    U->>FE: ketik NIK penonton (16 digit)
    FE->>G: POST /booking-sessions/{sessionId}/attendee-checks { nik }
    G->>B: teruskan
    B-->>FE: 200 { result: AVAILABLE | ALREADY_REGISTERED | CHECK_LIMIT_REACHED, checksRemaining }
    Note over FE: ALREADY_REGISTERED = blok baris.<br/>CHECK_LIMIT_REACHED = tidak blok (server validasi final)
  end

  U->>FE: klik "Lanjut Bayar"
  FE->>G: POST /booking-sessions/{sessionId}/buyer { buyerNik, email }   %% FE-NEED (mock setBuyer)
  G->>B: teruskan
  B-->>FE: 200 BookingSession (buyerNikMasked terisi)

  FE->>G: POST /bookings { sessionId, items[1..3]{categoryId, attendee{nik,fullName}} }<br/>header Idempotency-Key
  G->>B: teruskan
  alt hold berhasil
    B-->>FE: 201 Booking { bookingId, orderId, publicRef, amountMinor, ticketQuantity, buyerNikMasked, paymentExpiresAt, paymentPageUrl }
    FE->>U: redirect ke payment.html?bookingId=...
  else gagal
    B-->>FE: 409/422 { errorCode: CATEGORY_UNAVAILABLE | BUYER_QUOTA_EXHAUSTED | QUANTITY_EXCEEDS_LIMIT | MIXED_CATEGORIES_NOT_ALLOWED | ATTENDEE_NIK_DUPLICATE_IN_ORDER }
    FE->>U: toast pesan, refresh ketersediaan bila perlu
  else sesi habis
    B-->>FE: 410 { errorCode: SESSION_EXPIRED }
    FE->>U: redirect ke expired.html?sessionId=...&reason=booking
  end
```

> **Checkbox "Gunakan NIK pembeli (pembeli ikut nonton)"**: mengisi `attendee.nik = buyerNik` &
> `attendee.fullName = nama pembeli` otomatis; **single-use** (hanya satu tiket) agar tidak memicu
> `ATTENDEE_NIK_DUPLICATE_IN_ORDER`.

### 2.4 Payment (attempt → SNAP → callback → hasil)

> **KOREKSI (2026-10-29, user) — ikuti prototype.** Model pembayaran = **FE membangun halaman pembayaran** (`.genesis/prototype/Final/payment.html`): ringkasan pesanan (total = `amountMinor`, **tanpa biaya layanan**), **UI pemilihan metode** (VA BCA/BNI/BRI/Permata · QRIS · GoPay, dari `page.methods`), dan timer 10-menit server-authoritative (`paymentExpiresAt` + `serverTime`). "Bayar" → `createAttempt(bookingId, method, Idempotency-Key)` → **BE mengembalikan `redirectUrl` SNAP Midtrans** → FE handoff ke SNAP (web: redirect; mobile: WebView) → SNAP (gateway 3rd-party) menampilkan UI charge sebenarnya (prototype mensimulasikan via `snap.html`) → dua callback success/failed (`successReturnUrl`/`failedReturnUrl`) → FE **verifikasi status ke BE** (`GET /payments/{id}/status`), tidak pernah percaya callback saja. Konsekuensi terhadap diagram di bawah:
> - Blok `opt mobile WebView` (page-token / `rb_pay` / `POST /payment-page-sessions`) **TETAP scope FE** (D10.3) — halaman bayar FE yang sama dipakai ulang di WebView mobile lewat one-time pageToken; timer tetap server-authoritative lintas handoff. Diagram di bawah akurat.
> - Pemilihan metode terjadi **di halaman FE kita** (bucket metode); detail instrumen (no. kartu/VA/PIN) terjadi di SNAP → PCI tetap di luar scope.
> - **FR-24 dipenuhi oleh halaman bayar FE reusable + handoff SNAP** (konsisten web+mobile tanpa membangun ulang UI native).
> - **Terbuka (O2, diskusikan dengan BE):** bentuk persis request/response `createAttempt`, endpoint page-token (`POST /payments/{id}/page-tokens`, `POST /payment-page-sessions`), dan bentuk success/failed return URL untuk web vs WebView mobile.

Pilih metode → buat attempt → redirect ke SNAP → kembali ke success/failed callback → verifikasi status BE.

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as FE (payment.html / WebView)
  participant G as Gateway
  participant P as Payment Service
  participant M as SNAP

  FE->>G: GET /payments/{bookingId}/page
  G->>P: teruskan
  P-->>FE: 200 PaymentPage { methods[], amountMinor, paymentExpiresAt, serverTime, currentAttempt? }
  Note over FE,U: countdown 10 menit dari (paymentExpiresAt - serverNow)

  opt mobile WebView (reuse halaman web)
    FE->>G: POST /payments/{bookingId}/page-tokens
    P-->>FE: 201 { pageToken, pageUrl }
    FE->>G: POST /payment-page-sessions { pageToken }
    P-->>FE: 204 (set cookie rb_pay)
  end

  U->>FE: pilih metode (VA_BCA/BNI/BRI/PERMATA | QRIS | GOPAY), klik Bayar
  FE->>G: POST /payments/{bookingId}/attempts { method }<br/>header Idempotency-Key
  G->>P: teruskan
  P->>M: buat transaksi SNAP
  M-->>P: redirectUrl + return URLs
  P-->>FE: 201 Attempt { status: PENDING, redirectUrl, successReturnUrl, failedReturnUrl, expiresAt }
  FE->>U: redirect ke SNAP
  U->>M: selesaikan atau batalkan pembayaran
  M-->>FE: redirect successReturnUrl atau failedReturnUrl
  FE->>G: GET /payments/{bookingId}/status
  G->>P: teruskan
  P-->>FE: 200 { bookingStatus, orderId, paymentExpiresAt, attempt.status }
  alt bookingStatus = PAID
    FE->>U: render success.html
  else attempt FAILED dan booking masih payable
    FE->>U: render expired.html?reason=payment-failed → coba metode lain
  else EXPIRED / deadline passed
    FE->>U: render expired.html?reason=payment
  else VERIFYING / REVIEW / UNKNOWN
    FE->>U: tampilkan status sedang diproses dan polling/query dengan backoff
  end
```

### 2.5 Success (e-tiket)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as FE (success.html)
  participant G as Gateway
  participant B as Booking Service

  FE->>G: GET /payments/{bookingId}/status (verifikasi callback)
  G->>B: (via Payment) konfirmasi
  B-->>FE: 200 { bookingStatus: PAID, orderId }
  FE->>G: GET /bookings/{bookingId} (ringkasan order)
  G->>B: teruskan
  B-->>FE: 200 { orderId, amountMinor, ticketQuantity, buyerNikMasked, items[] }
  FE->>G: GET /bookings/{bookingId}/tickets
  G->>B: teruskan
  alt sudah PAID
    B-->>FE: 200 TicketList { orderId, publicRef, amountMinor, ticketQuantity, buyerNikMasked, tickets[]{ ticketCode, categoryCode, attendeeName, attendeeNikMasked, qrPayload } }
    FE->>U: render e-tiket + QR (unduh = window.print)
  else belum PAID
    B-->>FE: 409 { errorCode: BOOKING_NOT_PAYABLE }
    FE->>U: arahkan kembali ke pembayaran
  end
  Note over B,U: email e-tiket dikirim backend (event), bukan dipanggil FE
```

---

## 3. State Diagrams

Mengikuti enum pada contract (`Booking.status`, `Attempt.status`, `QueueEntry.status`).
Transisi dipicu oleh server; FE hanya **mengamati** (SSE/polling bila diperlukan, serta status check
setelah SNAP return) dan bereaksi di UI.

### 3.1 State Booking

```mermaid
stateDiagram-v2
  [*] --> PENDING_PAYMENT: POST /bookings (hold sukses)
  PENDING_PAYMENT --> VERIFYING: pembayaran diproses (webhook masuk)
  VERIFYING --> PAID: pembayaran sukses
  VERIFYING --> REVIEW: perlu tinjauan manual (fraud check)
  REVIEW --> PAID: lolos
  REVIEW --> CANCELLED: ditolak
  PENDING_PAYMENT --> EXPIRED: TTL pembayaran habis (10 mnt)
  PENDING_PAYMENT --> CANCELLED: dibatalkan sebelum bayar
  PAID --> [*]: e-tiket terbit
  EXPIRED --> [*]
  CANCELLED --> [*]

  note right of PAID
    FE: GET /bookings/{id}/tickets
    (success.html)
  end note
  note right of EXPIRED
    FE: expired.html?reason=payment
    stok dilepas ke antrean berikutnya
  end note
```

### 3.2 State Payment Attempt

```mermaid
stateDiagram-v2
  [*] --> CREATED: POST /payments/{id}/attempts
  CREATED --> PENDING: SNAP attempt + redirectUrl terbit
  PENDING --> SUCCEEDED: user bayar + webhook settle
  PENDING --> FAILED: SNAP mengembalikan gagal
  PENDING --> EXPIRED: lewat batas waktu
  PENDING --> UNKNOWN: status gateway belum pasti
  PENDING --> CANCELLED: attempt dibatalkan oleh provider/BE
  UNKNOWN --> SUCCEEDED: rekonsiliasi
  UNKNOWN --> FAILED: rekonsiliasi
  UNKNOWN --> EXPIRED: deadline terlewati
  SUCCEEDED --> REFUND_REQUIRED: reversal/dispute
  SUCCEEDED --> [*]
  FAILED --> CREATED: FE membuat attempt baru bila booking masih payable
  CANCELLED --> [*]
  EXPIRED --> [*]
  REFUND_REQUIRED --> REFUNDED: refund selesai
  REFUNDED --> [*]

  note right of PENDING
    FE GET /payments/{id}/status
    setelah SNAP return/resume
  end note
```

### 3.3 State Queue Entry

```mermaid
stateDiagram-v2
  [*] --> WAITING: POST /queue-entries
  WAITING --> ADMITTED: giliran tiba (servingSeq capai posisi)
  WAITING --> LEFT: user keluar antrean (DELETE)
  ADMITTED --> CLAIMED: POST /claim (dapat admissionToken)
  ADMITTED --> MISSED: admissionToken kedaluwarsa (TTL 60s)
  CLAIMED --> COMPLETED: booking selesai dibuat
  WAITING --> SOLD_OUT: tiket habis saat menunggu
  WAITING --> CLOSED: penjualan ditutup
  WAITING --> ENDED: event/antrean berakhir
  CLAIMED --> [*]
  COMPLETED --> [*]
  MISSED --> [*]
  LEFT --> [*]
  SOLD_OUT --> [*]
  CLOSED --> [*]
  ENDED --> [*]

  note right of ADMITTED
    FE auto-claim lalu
    auto-redirect ke detail.html
  end note
```

---

## 4. Polling / Timing

FE menerima redirect callback dari SNAP, tetapi callback hanya menjadi pemicu navigasi. FE tetap
meminta status dari BE sebelum menampilkan hasil. Timer dihitung dari deadline server.

### 4.1 Waiting Room — polling adaptif

Interval diatur server via `nextPollAfterMs` (makin dekat giliran, makin cepat). FE tidak hard-code interval.

```mermaid
flowchart LR
  A["Mulai (masuk waiting room)"] --> B["GET /queue-status + /queue-entries/me"]
  B --> C{"status ADMITTED?"}
  C -->|"ya"| D["auto-claim → redirect detail"]
  C -->|"belum"| E["tunggu nextPollAfterMs<br/>(far/mid/near)"]
  E --> B
  B -.->|"soldOut / CLOSED"| F["state error"]
```

| Zona posisi | Interval (dari `poll`) | Keterangan |
|---|---|---|
| Jauh dari giliran (`> farAbove`) | `poll.farMs` (mis. 15 dtk) | hemat request |
| Sedang (`> midAbove`) | `poll.midMs` (mis. 6 dtk) | — |
| Dekat giliran | `poll.nearMs` (mis. 2.5 dtk) | responsif |

### 4.2 Payment — callback + status verification

```mermaid
flowchart LR
  A["Attempt dibuat (PENDING)"] --> B["redirect ke SNAP"]
  B --> C["SNAP success/failed callback"]
  C --> D["GET /payments/{id}/status"]
  D --> E{"bookingStatus?"}
  E -->|"PAID"| F["success.html"]
  E -->|"FAILED + masih payable"| G["expired.html?reason=payment-failed"]
  E -->|"EXPIRED / deadline passed"| H["expired.html?reason=payment"]
  E -->|"PENDING"| D
```

### 4.3 Timer (server-authoritative)

Berlaku untuk **TTL booking (5 mnt)** dan **TTL pembayaran (10 mnt)**:

```
sisaMs   = expiresAt - serverNow()
serverNow() = Date.now() + (serverTime - clientNow)   // offset dari respons API
```

FE menampilkan hitung mundur dari `sisaMs`. Karena berbasis `expiresAt` absolut dari server,
**refresh / pindah perangkat tidak mereset** timer, dan jam perangkat yang meleset terkoreksi.

---

*Disusun dari sudut pandang FE; konsisten dengan prototype V5 dan API contract. Endpoint bertanda
**FE-NEED** adalah usulan FE yang belum ada di contract (detail & justifikasi di
`./FE-BE-align-contract.md`).*
