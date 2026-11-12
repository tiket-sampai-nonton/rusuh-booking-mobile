# FE-BE Align Contract — Rusuh Booking Tiket

Dokumen ini memetakan kebutuhan data Front-End (FE) terhadap API Contract (Back-End/BE) untuk proyek **Rusuh Booking Tiket**, menyoroti bagian yang sudah selaras dan bagian yang masih menjadi *gap*, lalu memberi rekomendasi yang diprioritaskan.

**Implementasi FE yang dikunci:** satu aplikasi **Expo + React Native** untuk Android/iOS dan **React Native Web** untuk web, dengan Clean Architecture, shared TypeScript domain/use cases, Zustand untuk client state, dan platform adapters. Dokumen ini tetap platform-neutral pada level API; nama `index.html`, `event.html`, dan seterusnya adalah logical screen labels from the V5 prototype, not separate web applications.

---

## 1. Tujuan & Hierarki Sumber Kebenaran

Dokumen ini dipakai sebagai acuan bersama FE dan BE agar implementasi layar FE hanya memanggil field/endpoint yang benar-benar ada di contract, dan agar setiap kebutuhan FE yang belum terpenuhi menjadi keputusan sadar (bukan asumsi).

### Addendum — RBT-128 integration check (2026-11-09)

For the historical RBT-128 integration check, see [`api-contract/07-11/INTEGRATION-RBT-128.md`](api-contract/07-11/INTEGRATION-RBT-128.md). Its dated findings are retained; the live-runtime addendum below supersedes its earlier CORS, description, and payment-route observations.

### Addendum — live runtime confirmation (2026-11-12)

- The live event-detail response for event `ec2f4c95-6247-4ee7-9524-2e5530edbfe4` includes `imageUrl`, `bannerUrl`, `thumbnailUrl`, categories, and a `description` object with `longDesc`, `lineup`, `location`, `gallery`, and `terms`. FE parses these fields defensively in `domain/rules/event-description.ts`; event-detail content is no longer an outstanding runtime gap. The 07-11 generated public contract snapshot does not yet describe this `description` shape, so BE schema documentation still needs alignment.
- The payment service returns a site-relative `pageUrl` (`/pay/{bookingId}?ppt=…&embedded=1`). The configured API origin does not host `/pay`. Browser inspection on 2026-11-12 found the currently deployed Pages app returned its Expo "Unmatched Route" screen for `/pay`; this branch adds the missing `/pay/[bookingId]` bootstrap route. That route must be included in a web deployment before a native app can use it. A credentialed OPTIONS preflight from `https://rusuh-booking.pages.dev` to `POST /api/v1/payment-page-sessions` returned 204 and allowed that origin. Physical iOS/Android cookie persistence and SNAP return behavior remain unverified.

Hierarki sumber kebenaran (urutan otoritas, atas menang atas bawah):

1. **PDF "Tender Rusuh Booking Ticket"** — *source of truth* untuk **WHAT & WHY**: ruang lingkup, aturan bisnis, prinsip UX, dan prioritas MoSCoW.
2. **API Contract (5 file OpenAPI di `.genesis/docs/api-contract/`)** — turunan sah dari PDF oleh tim (PDF + edge case + hasil diskusi). Tetap mengacu PDF, hanya menambah detail teknis. Ini **otoritas teknis** untuk field, enum, dan alur pemanggilan.
3. **Dokumen requirement/architecture di `.genesis/requirement/`** — keputusan FE, UX, edge case, dan kesiapan implementasi. Dokumen ini kalah dari PDF & contract bila berbeda.
4. **Prototype V5 (`.genesis/prototype/Final/*`)** — prototype UX dan pemanggilan terkini. `api.js` mengikuti envelope, harga `*Minor`, `serverTime`/deadline, enum, error code, dan idempotency yang tersedia di contract, tetapi juga menambahkan field/mock endpoint yang diberi komentar **GAP/FE-NEED**. Prototype V5 bukan bukti bahwa BE sudah menyediakan field tersebut. (**Prototype V1** = mock awal **pra-contract**; hanya arsip tampilan, bukan acuan field/alur.)

### Logical screen → V5 URL → Expo Router route

V5 is a static HTML prototype, so it uses query parameters. The production Expo app uses
typed route parameters. The identifier meaning stays the same in both implementations.

| Prototype label | V5 static URL | Locked Expo route |
|---|---|---|
| `index.html` | `index.html` | `/` |
| `browse.html` | `browse.html?genre=&province=&time=&sort=` | `/browse?genre=&province=&time=&sort=` |
| `event.html` | `event.html?eventId={eventId}` | `/events/[eventId]` |
| `waiting.html` | `waiting.html?eventId={eventId}` | `/waiting/[eventId]` |
| `detail.html` | `detail.html?sessionId={sessionId}` | `/checkout/[sessionId]` |
| `payment.html` | `payment.html?bookingId={bookingId}` | `/payment/[bookingId]` |
| `success.html` | `success.html?bookingId={bookingId}&orderId={orderId}` | `/success/[bookingId]?orderId={orderId}` |
| `expired.html` | `expired.html?bookingId={bookingId}&reason=payment` or `expired.html?sessionId={sessionId}&reason=booking` | `/expired/[resourceId]?reason=booking|payment|payment-failed` |

`resourceId` is a `sessionId` when the selection session expires and a `bookingId` when a
payment booking expires or a SNAP attempt fails. `eventId` remains event context only; it is
not the checkout identity.

> Prinsip: bila `requirement.md` atau prototype meminta sesuatu yang tidak ada di contract, itu dicatat sebagai **gap** — bukan diizinkan "mengarang" field.

---

## 2. Konvensi Lintas-API

Konvensi berikut berlaku untuk **semua** service dan wajib dipatuhi FE.

| Konvensi | Aturan | Catatan Implementasi FE |
|---|---|---|
| **Envelope respons** | Semua respons sukses berbentuk `{ "meta": { "code", "message" }, "data": { ... } }`. Error memakai `ErrorEnvelope` `{ "meta": {...}, "data": null }`. | Selalu baca payload dari `response.data`, bukan root. |
| **Harga `*Minor`** | Semua nominal uang bertipe `integer int64` dalam **minor unit IDR** (rupiah penuh, tanpa desimal — contoh `450000` = Rp 450.000). Field: `minPriceMinor`, `priceMinor`, `amountMinor`. | Format ke "Rp" di sisi FE; jangan kirim/terima string berformat. |
| **`serverTime` & deadline** | Payload utama membawa `serverTime` dan deadline absolut ISO-8601: `expiresAt` untuk booking-session, `paymentExpiresAt` untuk booking/payment attempt, dan `claimDeadline` untuk admission token. | Hitung sisa waktu dari deadline server dan server-clock offset; **jangan** pakai jam lokal sebagai sumber keputusan. Saat timer nol, lakukan satu status check terakhir sebelum menampilkan terminal state. |
| **Token web vs mobile** | Web: cookie `rb_visitor` (HttpOnly). Mobile: header `X-Visitor-Token`. Payment WebView: cookie `rb_pay`. Ticket link: query `?t=`. Login (opsional): `Authorization: Bearer <JWT>`. | FE web tidak perlu menyimpan visitor token manual; cookie di-handle browser. Mobile wajib kirim header di tiap request antre/booking/payment. |
| **`Idempotency-Key`** | Contract saat ini **wajib** pada `POST /bookings`, `PUT /bookings/{id}/items`, dan `POST /payments/{id}/attempts`. Panjang **16–64 char**, unik per tombol; retry memakai key yang **sama**. Queue `503` menyebut retry dengan key yang sama, tetapi endpoint join/claim belum mendefinisikan header tersebut. | Generate sekali saat tombol ditekan, simpan, pakai ulang untuk retry/timeout. BE perlu menyamakan aturan queue sebelum production. |
| **`errorCode`** | Error dibedakan lewat kode pada deskripsi/meta (mis. `VALIDATION_ERROR`, `NIK_ALREADY_IN_QUEUE`, `EVENT_SOLD_OUT`, `TURN_MISSED`, `SESSION_EXPIRED`, `BOOKING_VERSION_CONFLICT`, `BOOKING_NOT_PAYABLE`, `RATE_LIMITED`). | Petakan tiap errorCode ke pesan UX; hormati header `Retry-After` pada `429`. |
| **Auth opsional (ADR-020)** | Guest checkout tidak butuh User Service. Login hanya menambah riwayat, profil, dan **fast-track auto-fill** nama/NIK/email di `detail.html`. Akun dibuat saat `verify` OTP pertama; **email BARU wajib melengkapi profil** (`fullName`+`nik`) via `PATCH /me` sebelum sesi aktif (= langkah registrasi). | Jangan jadikan login sebagai prasyarat alur beli; login adalah jalur cepat opsional untuk mengisi nama/NIK/email otomatis. Entri login ada di **landing** (tombol "Masuk / Daftar"), bukan di `detail.html`. |
| **Antrean anonim (baru)** | Masuk antrean tidak lagi meminta data apa pun (NIK/email). Pengumpulan `buyerNik` + `email` dipindah ke tahap `detail.html` (checkout). | Join queue secepat mungkin tanpa form; identitas pembeli diambil belakangan (lihat §5). |

---

## 3. Kebutuhan Data FE per Screen (requirement.md) → Field Contract → Status

Tabel ini mendaftar, untuk tiap halaman, **data apa yang perlu ditampilkan FE** dan apakah data itu **sudah disediakan contract**. Tujuannya dua: (1) memastikan setiap permintaan di `requirement.md` sudah terjawab, dan (2) memberi BE daftar jelas hal yang masih perlu ditambahkan ke contract (baris bertanda **FE NEED THIS**).

Bagian ini menjawab *"butuh data apa, dan apa yang masih kurang"*. Untuk *"endpoint mana yang dipanggil tiap halaman"*, lihat §4. Keduanya saling melengkapi.

Arti status: ✅ sudah ada di contract · ⚠️ ada tapi belum lengkap · ❌ belum ada (**FE NEED THIS** = perlu ditambahkan BE).

| Screen | Data diminta `requirement.md` | Field/Endpoint Contract yang memenuhi | Status | Catatan |
|---|---|---|---|---|
| **1. Landing** | Card banner image | `EventSummary.imageUrl`, `bannerUrl`, `thumbnailUrl` | ✅ | All URLs are optional in the wire response; FE uses an image fallback when they are absent. |
| **1. Landing** | Card: tanggal format **DD MMM YYYY** | `EventSummary.startsAt` (`GET /api/v1/events`) | ✅ | Format DD MMM YYYY **diderivasi FE** dari `startsAt` (ISO-8601). Tidak butuh perubahan contract. |
| **1. Landing** | Card: place | `EventSummary.venue` | ⚠️ | Hanya `venue` (string bebas). Tidak ada field kota/alamat terstruktur. |
| **1. Landing** | Card: **jumlah tiket tersedia** (remainingTickets) | — (di level list) | ❌ **FE NEED THIS** | Di level list `EventSummary` hanya beri `status` + `minPriceMinor`; **tidak ada** jumlah sisa. Usulan: tambah `remainingTickets` (integer) ke `EventSummary`. Di prototype dipakai mock `remainingTickets`. |
| **1. Landing** | Badge **"Tersedia"** / **"Stok Menipis"** | `EventSummary.status` (hanya kasar); ambang menipis dari `remainingTickets` | ❌ **FE NEED THIS** | "Tersedia" kasar dari `status=AVAILABLE`. "Stok Menipis" perlu **ambang** atas angka sisa yang resmi → bergantung pada `remainingTickets` (lihat baris di atas). Badge "Segera"/`NOT_STARTED` lama tidak lagi jadi fokus. |
| **1. Landing** | Seksi **"Konser Terdekat"** (event mendatang, sort ascending by `startsAt`, paling dekat hari ini) | `GET /api/v1/events` (tanpa `sort`/`limit`/`near`) | ❌ **FE NEED THIS** | Tidak ada parameter `sort`/`limit`/`near`. FE sort ascending & slice **client-side**. Usulan param: `sort`, `limit`, `near`. |
| **1. Landing** | Tombol **Filter Event** | Tidak ada query filter pada `GET /api/v1/events` | ⚠️ **PROTOTYPE GAP** | V5 membuka modal dengan **Genre Musik, Lokasi (Provinsi), Waktu, Urutkan** lalu mengarah ke `browse.html`. Filter dilakukan client-side karena contract belum menyediakan parameter. |
| **2. Browse** | Hasil filter event mendatang + chip hapus/reset + filter ulang | `GET /api/v1/events` (tanpa query param) | ⚠️ **PROTOTYPE GAP** | V5 memakai URL `genre`, `province`, `time`, `sort`; time = rolling 7/30/90 hari dari `serverTime`, sort = closest/furthest. Production membutuhkan field genre/lokasi terstruktur dan idealnya filter/sort/paginasi server-side. |
| **1. Landing** | Seksi **"History Event"** (event yang SUDAH berlalu, sort by tanggal **desc**) | — (tidak ada endpoint arsip/riwayat event publik) | ❌ **FE NEED THIS** | Menggantikan seksi "Selling Fast/stok habis". V5 menurunkan history **client-side** dari event ber-`status CLOSED` / `startsAt < serverTime`, lalu sort desc. Production membutuhkan `GET /events?filter=past` atau endpoint arsip + `sort`/`limit`, terutama bila catalog dipaginasi. |
| **1. Landing** | Status (live/upcoming) | `EventSummary.status` (`NOT_STARTED|AVAILABLE|SOLD_OUT|CLOSED`) | ⚠️ | Enum tidak punya "LIVE"; FE menurunkan "upcoming vs live" dari `salesStartsAt`/`startsAt` vs `serverTime`. |
| **1. Landing** | Footer | — (statis) | ✅ | Konten statis FE; tidak butuh API. |
| **2. Detail Event** | Lokasi | `event.venue` + optional `description.location` | ✅ | Venue is the display fallback; rich location may provide a name, address, maps URL, coordinates, and map image. |
| **2. Detail Event** | Date | `EventSummary.startsAt` | ✅ | — |
| **2. Detail Event** | Description JSON: **long desc** | `EventDetail.description.longDesc` | ✅ | Present in the live detail API and rendered by the event-detail screen. |
| **2. Detail Event** | Description JSON: **S&K** | `EventDetail.description.terms[]` | ✅ | Returned as strings; the parser also tolerates one legacy string. |
| **2. Detail Event** | Description JSON: **line up** | `EventDetail.description.lineup[]` | ✅ | Live records use `{name, role, avatar?}`; the parser also tolerates prototype `{stage, acts}` records. |
| **2. Detail Event** | Gallery | `EventDetail.description.gallery[]` | ✅ | Optional image URL array; missing or invalid URLs degrade to no gallery items. |
| **2. Detail Event** | **Banner image** | `event.bannerUrl` / optional `description.bannerImage` | ✅ | The event response carries media URLs at the event level; `description.bannerImage` remains optional. |
| **2. Detail Event** | Category tiket | `EventDetail.categories[]` (`categoryId, code, name, priceMinor, available`) | ✅ | — |
| **2. Detail Event** | Ticket max | `EventDetail.maxTicketsPerOrder`, `maxTicketsPerBuyerNik`, `allowMixedCategories` | ✅ | `maxTicketsPerOrder` membatasi 1 order; `maxTicketsPerBuyerNik` lintas sesi/perangkat. |
| **2. Detail Event** | Ticket now (sisa) | `EventDetail.categories[].available` | ✅ | Angka momentary (cache 2 detik); real-time pakai queue-status/SSE. |
| **3. Waiting Room** | Queueing number | `QueueEntry.seq`; posisi eksak `EntryStatus.exactPosition` (`GET /queue-entries/me`) | ✅ | `seq` dari join; posisi live dari status doc + `/me`. |
| **3. Waiting Room** | Status | `EntryStatus.status`/`zone`; `StatusDocument.saleState, servingSeq, soldOut` | ✅ | `zone`: `GUARANTEED|POSSIBLE|NOT_ENOUGH`. |
| **3. Waiting Room** | Estimation time + configurable polling | `StatusDocument`: `admissionRatePerMin` (**internal, tidak ditampilkan**), `servingSeq`, `nextPollAfterMs`, `poll{farMs,midMs,nearMs,farAbove,midAbove}`, `preTurnNotifyPosition` | ✅ | UI hanya menampilkan **"orang di depan"** + **"estimasi"**. "Laju antre" (`admissionRatePerMin`) **tidak ditampilkan** sebagai metrik; tetap dipakai internal untuk hitung estimasi. Interval polling diatur server. |
| **4. Checkout** | List category: title/subtitle/value | `BookingSession.categories[]` / `EventDetail.categories[]` (`name`=title, `code`, `priceMinor`=value) | ⚠️ | Ada `name` & `priceMinor`; **tidak** ada field "subtitle"/deskripsi kategori. "Subtitle" di `requirement.md` harus statis/derivasi FE. |
| **4. Checkout** | Total per kategori / total checkout | Dihitung FE dari `priceMinor × qty`; sumber otoritatif `Booking.amountMinor` | ✅ | Tampilan boleh dihitung FE, nilai final tetap `Booking.amountMinor`. |
| **4. Checkout** | Data reservation: **Name** | `Profile.fullName` (bila login, auto-fill) | ⚠️ | Guest mengisi nama manual (nama penumpang). Bila login, `Profile.fullName` dipakai untuk mengisi nama penumpang otomatis saat **"pembeli ikut nonton"** dicentang. Nama pemesan vs nama penumpang (`attendee.fullName`) tetap terpisah. |
| **4. Checkout** | Data reservation: **NIK** (pembeli) | `POST /api/v1/bookings` → `buyer.nik` atau `buyer.useLoginNik` | ✅ | Manual entry adalah default. Login opsional dapat memilih NIK akun dengan `buyer.useLoginNik: true`; kirim bearer pembeli, hilangkan `buyer.nik`. FE hanya melihat NIK tersamar dan tidak mengambil/menyimpan NIK akun mentah. `NIK_NOT_LINKED` mengarahkan pengguna ke input manual. |
| **4. Checkout** | Data reservation: **EMAIL** (pembeli) | **Dikumpulkan di `detail.html`**; belum ada tempat di contract | ❌ **FE NEED THIS** | Dipindah ke checkout bersama NIK. Email dikumpulkan saat request OTP (login/daftar) dan ditampilkan read-only di langkah registrasi; lalu **auto-fill** di detail bila login. Usulan ikut `setBuyer`/body `POST /bookings`. Dipakai untuk **e-tiket**. |
| **4. Checkout** | Data reservation: **phone number** | — | ❌ | Contract **tidak** menyimpan nomor telepon di mana pun. Kontak pembeli = email saja. |
| **4. Checkout** | Data penumpang (per tiket): Name + NIK, bisa termasuk pemesan | `HoldRequest.items[].attendee{nik, useLoginNik, fullName}` (1..3 item); cek `POST /booking-sessions/{id}/attendee-checks` untuk NIK manual | ✅ | Manual NIK tetap default. Checkbox **"Gunakan data pembeli"** mengisi nama dari buyer dan mengunci field. Jika buyer memakai NIK akun, satu baris attendee dapat mengirim `useLoginNik: true` tanpa `nik`; BE hanya mengizinkan satu attendee seperti ini per pesanan dan buyer harus sama-sama memakai `useLoginNik`. NIK tersimpan tidak dicek di FE; BE tetap memutuskan duplikat/kuota. |
| **4. Checkout** | Validasi baris tiket (min 1, maks `maxSelectable` ≤3) | `BookingSession.maxSelectable`; `attendee-checks` (`AVAILABLE|ALREADY_REGISTERED|CHECK_LIMIT_REACHED` + `checksRemaining`) | ✅ | NIK manual divalidasi 16 digit + nama terisi + bukan `ALREADY_REGISTERED`. Untuk NIK akun, FE tidak mewajibkan input atau melakukan attendee-check; BE memvalidasi autentikasi, link akun, duplikat, dan kuota. `CHECK_LIMIT_REACHED` **tidak memblok**. |
| **4. Checkout** | **Biaya layanan** (service fee) | — | ❌ | Tidak ada di contract **maupun** PDF. `amountMinor` = total tanpa breakdown fee. |
| **5. Confirmation Order** | Order detail | `Booking` (`bookingId, orderId, publicRef, status, amountMinor, ticketQuantity, buyerNikMasked, items[], paymentExpiresAt`) (`GET /bookings/{id}`) | ✅ | `items[]` beri `attendeeName` + `attendeeNikMasked` + `categoryId`; success summary fields are explicit in the contract. |
| **6. Payment** | SNAP / halaman bayar | `GET /payments/{bookingId}/page` (`methods[], amountMinor`), `POST /payments/{bookingId}/attempts` → `Attempt.redirectUrl` | ⚠️ | Gateway = **SNAP** (provider eksternal). FE tidak memproses pembayaran; FE hanya memilih metode, redirect ke provider, lalu memverifikasi status setelah callback. |
| **6. Payment** | Metode kartu kredit | — | ❌ | Enum metode hanya `VA_BCA, VA_BNI, VA_BRI, VA_PERMATA, QRIS, GOPAY`. **Tidak ada** kartu kredit. |
| **7. Success/Fail** | Callback success/fail | SNAP return URL → `GET /payments/{bookingId}/status` (`bookingStatus`, `attempt.status`); provider webhook = backend only | ✅ | Callback hanya pemicu navigasi. FE selalu memverifikasi status BE. Email e-tiket/expired dikirim backend via event. |
| **7. Success/Fail** | Ticket detail | `GET /bookings/{bookingId}/tickets` (`orderId, publicRef, amountMinor, ticketQuantity, buyerNikMasked, tickets[]{ticketCode, categoryCode, attendeeName, attendeeNikMasked, qrPayload}`) | ✅ | Hanya tersedia setelah `status = PAID` (else `BOOKING_NOT_PAYABLE`). `qrPayload` wajib untuk setiap ticket. |
| **Opsional: Auth Login/Register (fast-track)** | Login/Register via OTP | User Service: `POST /api/v1/auth/otp/request`, `POST /api/v1/auth/otp/verify`, `GET /api/v1/me`, `PATCH /api/v1/me`, `/auth/refresh`, `/auth/logout` | ✅ | OTP email tanpa password; opsional (ADR-020). **Registrasi (nama+NIK) = verify OTP pertama + `PATCH /me {fullName, nik}`**. Entri login di landing. Nama/email dapat di-prefill; NIK hanya ditampilkan tersamar. NIK akun dipakai hanya setelah pengguna memilih `useLoginNik` saat checkout. |
| **Opsional: Indikator profil lengkap** | Tahu apakah akun baru perlu langkah registrasi (nama+NIK) | `GET /api/v1/me` (`hasNik`, `fullName`) | ⚠️ **FE NEED THIS** | Respons `POST /auth/otp/verify` (`TokenResponse`) **tidak** membawa flag "akun baru / profil belum lengkap". Prototype memakai `isNew` di mock `verifyOtp`, tapi contract tak punya. Rekomendasi: setelah verify, FE panggil `GET /me`; bila `hasNik=false`/`fullName` kosong → tampilkan form lengkapi profil → `PATCH /me`. (Idealnya `verify` memuat indikator profil-lengkap.) |
| **Opsional: Quick Form / Profiling (auto-fill)** | Isi cepat + profil untuk auto-fill | `GET/PATCH /api/v1/me` (`fullName`, `nik`→`nikMasked`, `hasNik`, `emailMasked`) | ✅ | Dipakai untuk **fast-track auto-fill** di `detail.html` (bukan di antrean). NIK plaintext tidak pernah dikirim BE ke FE; auto-fill nyata memakai data yang user sendiri simpan/isi (prototype menyederhanakan). NIK penumpang tetap diisi per order. |
| **Opsional: History Purchasement** | Riwayat pembelian | `GET /api/v1/me/bookings` (butuh login, cursor+limit) | ✅ | Hanya untuk user login; guest tidak punya riwayat. |

> **Current runtime shape — `description` JSON (Detail Event).** Live BE detail data provides these fields; the parser remains tolerant of missing or legacy values:
>
> ```json
> "description": {
>   "longDesc": "string",
>   "lineup": [{ "name": "string", "role": "string", "avatar": "https://..." }],
>   "location": { "name": "string", "address": "string", "mapsUrl": "https://...", "latitude": -6.9, "longitude": 107.6, "mapImage": "https://..." },
>   "gallery": ["https://..."],
>   "terms": ["string"],
>   "bannerImage": "https://..."
> }
> ```

> The 07-11 OpenAPI/Markdown snapshot still treats this field as absent/opaque. BE should add the live shape to its published schema before FE regenerates contract types.
>
> Alternatif: endpoint konten CMS terpisah (mis. `GET /events/{id}/content`). Prototype sudah mem-mock `description` JSON ini, sehingga gap P0 (deskripsi/S&K/line-up) ditutup **secara desain** — tinggal implementasi BE.

---

## 4. Pemetaan Per-Screen → API (Flow)

Catatan token diasumsikan terpasang otomatis (web: cookie `rb_visitor`; mobile: `X-Visitor-Token`). Semua endpoint di bawah sudah diverifikasi terhadap file OpenAPI.

### 4.0 Login / Register — Fast-track (opsional, User Service)
Login bersifat **opsional**: guest tetap bisa menyelesaikan pembelian dengan mengisi NIK+email manual di `detail.html`. Entri login ada di **landing** (tombol **"Masuk / Daftar"**) → modal OTP. Bila user login, data profil dipakai untuk **auto-fill** nama/NIK/email di detail.

| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `POST /api/v1/auth/otp/request` (User Service) | Kirim OTP 6 digit ke email (email dipakai untuk e-tiket) | body `{email}`; respons `{expiresInSeconds, resendAfterSeconds}` |
| 2 | `POST /api/v1/auth/otp/verify` (User Service) | Tukar OTP → token; **akun dibuat saat verify pertama (ADR-020)** | body `{email, code}`; respons `TokenResponse{tokenType, accessToken, refreshToken, account:Profile}` |
| 3 | `GET /api/v1/me` (User Service) | Cek kelengkapan profil & ambil data untuk auto-fill | `Profile{fullName, nikMasked, emailMasked, hasNik}` |
| 4 | `PATCH /api/v1/me` (User Service) | **Lengkapi registrasi akun baru**: simpan `fullName` + `nik` | body `UpdateProfileRequest{fullName, nik}`; respons `Profile` |
| ± | `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` | Rotasi/cabut sesi | `RefreshRequest{refreshToken}` |

**NOTE:**
- **Registrasi eksplisit untuk email BARU:** setelah `verify`, bila profil belum lengkap (`hasNik=false`/`fullName` kosong) FE menampilkan **form lengkapi profil** — user wajib mengisi `fullName` (Nama Lengkap) + `nik` (16 digit), sedangkan **email ditampilkan read-only** (email yang dipakai OTP, untuk e-tiket) — lalu `PATCH /me {fullName, nik}` menyimpan profil. Prototype menampilkan **pop-up "Pendaftaran Berhasil"** sebelum modal ditutup (mock `completeRegistration` meniru `PATCH /me` pasca verify pertama). Profil akun menyimpan `accountId, emailMasked, fullName, nikMasked, hasNik`.
- **Email LAMA → langsung login** (lewati langkah registrasi).
- **FE NEED THIS:** `TokenResponse` dari `verify` **tidak** memuat flag "akun baru / profil belum lengkap" (`isNew`). Rekomendasi: FE setelah `verify` panggil `GET /me`; bila `hasNik=false`/`fullName` kosong → tampilkan form lengkapi profil → `PATCH /me`. Idealnya `verify` memuat indikator profil-lengkap agar tak perlu *round-trip* tambahan (lihat §3 & §6).
- Auto-fill nama/NIK/email terjadi **di `detail.html`** (bukan di antrean). Lihat §4.4 baris `0a`.
- NIK plaintext **tidak pernah** dikirim BE→FE (hanya `nikMasked`); auto-fill nyata memakai data yang user simpan sendiri (prototype menyederhanakan dengan menyimpan NIK plaintext pada akun demo).

### 4.1 `index.html` — Landing / Home
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `GET /api/v1/events` (Booking) | Ambil seluruh katalog event | Contract: `events[]{eventId, slug, name, venue, startsAt, salesStartsAt, salesEndsAt, status, minPriceMinor}`, `serverTime`; V5 mock juga menambahkan `remainingTickets`, `city`, `category` sebagai GAP |

**NOTE (gap):**
- Navbar menyediakan tombol **"Masuk / Daftar"** → modal OTP (langkah auth/registrasi, lihat §4.0). Login opsional; tidak memblok alur beli.
- Seksi **"Konser Terdekat"** = event mendatang di-sort **ascending** by `startsAt`; **"History Event"** = event lampau (`status CLOSED` / `startsAt < serverTime`) di-sort **desc**. `GET /events` tak punya `sort`/`limit`/`near`/`filter=past` → V5 menurunkan semuanya **client-side** dari response katalog penuh. Production perlu keputusan server-side sort/pagination dan endpoint arsip.
- Card wajib menampilkan tanggal **DD MMM YYYY** (derivasi FE dari `startsAt`, OK) dan **jumlah tiket tersedia**. **FE NEED THIS**: tambah `remainingTickets` (integer) ke `EventSummary` (level list tidak punya angka sisa). Prototype memakai mock `remainingTickets`.
- Badge **"Tersedia"**/**"Stok Menipis"**: "Stok Menipis" butuh ambang atas `remainingTickets` → **FE NEED THIS** (sama seperti di atas). Badge "Segera"/`NOT_STARTED` tidak lagi jadi fokus.
- Tombol **Filter Event** tidak memfilter di halaman Home. V5 membuka modal dengan **Genre Musik, Lokasi (Provinsi), Waktu, Urutkan** lalu mengarah ke `browse.html`.
- **Filter production gap:** `GET /events` belum punya field genre/province terstruktur atau query `genre`, `province`, `time`, `sort`, pagination. V5 memfilter client-side dari katalog yang sudah di-fetch; untuk production, BE perlu menambah dukungan server-side atau menyetujui batas katalog yang aman.
- **Banner image** tidak ada di `EventSummary` → **FE NEED THIS** (`bannerUrl`/`thumbnailUrl`) atau sumber media tambahan.

### 4.1a `browse.html` — Filtered Event Results
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `GET /api/v1/events` (Booking) | Ambil katalog yang akan difilter | Contract `EventSummary[]`; V5 mock menambahkan `city`, `category`, dan `remainingTickets` |
| 2 | URL query `genre`, `province`, `time`, `sort` | Menjaga filter tetap shareable dan refresh-safe | `genre=all|Festival|Jazz|Rock|Elektronik|Folk|Orkestra|Etc`; `province=all|<province-id>`; `time=all|week|month|quarter`; `sort=closest|furthest` |

**NOTE (gap):** `browse.html` adalah tambahan V5. Hasil hanya event mendatang; `week`, `month`, dan `quarter` memakai rolling window 7/30/90 hari dari `serverTime`. Filter chip dapat dihapus satu per satu, di-reset, atau dibuka kembali. Karena contract belum menyediakan query/filter fields, ini **prototype-only client-side filtering**. Production harus menambahkan filter/sort/pagination server-side atau menetapkan batas katalog serta aturan canonical/noindex untuk URL hasil filter.

### 4.2 `event.html` — Detail Event
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `GET /api/v1/events/{eventId}` (Booking) | Detail event + kategori + aturan kuota | `event`, `maxTicketsPerOrder`, `maxTicketsPerBuyerNik`, `allowMixedCategories`, `categories[]{categoryId, code, name, priceMinor, available}` |
| 2 | `GET /api/v1/queue-status/{eventId}` (Queue, publik/CDN) | Status penjualan real-time untuk CTA "Masuk Antre" | `saleState`, `soldOut`, `remainingTickets`, `categories[].state` |

**NOTE (gap):** **FE NEED THIS** — `EventDetail` perlu field **`description` ber-format JSON** `{ longDesc, lineup:[{stage,acts}], terms:[string], bannerImage }` untuk menampilkan **long description, line-up, S&K, dan banner image** secara dinamis (atau endpoint konten CMS terpisah). Prototype sudah mem-mock `description` JSON ini → gap P0 ditutup secara desain, pending implementasi BE (lihat §3 & §6).

### 4.3 `waiting.html` — Waiting Room
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `POST /api/v1/events/{eventId}/queue-entries` (Queue) | **JOIN QUEUE anonim** — tanpa input NIK/email | body `JoinRequest` **(FE NEED THIS: dibuat opsional/anonim)**; respons `QueueEntry{entryId, seq, status, queueToken, visitorToken(mobile), statusUrl, claimDeadline, serverTime}` |
| 2 | `GET /api/v1/queue-status/{eventId}` (Queue, polling CDN) | Status antrean global + interval polling | `servingSeq`, `guaranteedUntilSeq`, `possibleUntilSeq`, `remainingTickets`, `admissionRatePerMin` (**internal, tidak ditampilkan**), `nextPollAfterMs`, `poll{...}`, `preTurnNotifyPosition` |
| 3 | `GET /api/v1/queue-entries/me?eventId=` (Queue) | Posisi eksak saat mendekati giliran | `exactPosition`, `zone`, `claimDeadline`, `redirect` |
| 4 | `POST /api/v1/queue-entries/{entryId}/claim` (Queue) | **AUTO-CLAIM** `admissionToken` saat giliran tiba (di balik layar) | `ClaimResponse{admissionToken (TTL 60s), bookingUrl}` |
| 5 | `DELETE /api/v1/queue-entries/{entryId}` (Queue) | (opsional) Keluar antrean | — |

**Flow:** join anonim (1) → polling status (2) dengan interval dari `nextPollAfterMs`/`poll` → saat dekat, panggil `/me` (3) → saat `ADMITTED`, **auto-claim** (4) tanpa tombol manual → **auto-redirect** langsung ke `POST /booking-sessions`/detail membawa `admissionToken`.
**NOTE:**
- UI hanya menampilkan **"orang di depan"** + **"estimasi"**. **"Laju antre" (`admissionRatePerMin`) tidak ditampilkan**; tetap dipakai internal untuk estimasi.
- Saat giliran tiba, FE **auto-claim + auto-redirect** (tanpa tombol manual).
- Interval polling **configurable dari server**; FE tidak boleh hard-code interval.
- **NIK/email pembeli TIDAK lagi diminta di sini** (antrean anonim); dipindah ke `detail.html` (lihat §4.4 & §5).

### 4.4 `detail.html` — Pilih Tiket / Checkout
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 0a | `GET /api/v1/me` (User Service, **bila login**) | Prefill nama/email + status keterhubungan NIK | `Profile{fullName, nikMasked, emailMasked, hasNik}`; tidak ada NIK mentah |
| 0b | Buyer identity pada `POST /api/v1/bookings` | Buyer manual atau NIK akun | `buyer{nik}` (manual) **atau** `buyer{useLoginNik:true}` (bearer wajib, hilangkan `nik`) bersama email/consent |
| 1 | `POST /api/v1/booking-sessions` (Booking) | Tukar `admissionToken` → sesi pilih | body `{admissionToken}`; respons `BookingSession{sessionId, phase, reservedUnits, maxSelectable, buyerNikMasked, allowMixedCategories, expiresAt, serverTime, submitGraceSeconds, selectionWarningSeconds, editEnabled, maxEdits, categories[], booking?}` |
| 2a | `GET /api/v1/booking-sessions/{sessionId}/stream` (SSE) | Ketersediaan & timer live | event `availability`, `timer` |
| 2b | `GET /api/v1/booking-sessions/{sessionId}` (Booking) | Fallback polling bila SSE putus | `phase`, `expiresAt`, `categories[].available` |
| 3 | `POST /api/v1/booking-sessions/{sessionId}/attendee-checks` (Booking) | Validasi NIK penumpang saat diketik | body `{nik}`; respons `{result: AVAILABLE|ALREADY_REGISTERED|CHECK_LIMIT_REACHED, checksRemaining}` |
| 4 | `POST /api/v1/bookings` (Booking, **Idempotency-Key wajib**) | Hold tiket + buyer dan penumpang | body `HoldRequest{sessionId, buyer{nik|useLoginNik, email, emailConfirmation, consent}, items[1..3]{categoryId, attendee{nik|useLoginNik, fullName}}}`; bearer wajib untuk mode akun; response tetap memberi NIK masked |
| 5 | `GET /api/v1/booking-sessions/current?eventId=` (Booking) | Pulihkan sesi/pesanan setelah refresh/back | `BookingSession` (+`booking` bila sudah hold) |

**NOTE (gap):**
- **NIK & email pembeli dikumpulkan di checkout**, bukan di join queue. NIK manual adalah default; akun login boleh memilih `buyer.useLoginNik=true`, bearer token tetap dikirim, dan `buyer.nik` dihilangkan. FE tidak mengambil/menyimpan NIK mentah dari akun.
- **Checkbox "Gunakan data pembeli" per tiket:** menyalin nama pembeli dan satu kali memilih NIK buyer sebagai attendee. Dengan buyer manual, payload mengirim attendee `nik`; dengan buyer `useLoginNik`, payload mengirim `attendee.useLoginNik=true` tanpa `nik`. API hanya mengizinkan satu attendee saved-NIK dan mensyaratkan buyer `useLoginNik=true`.
- **Validasi baris:** min 1, maks `maxSelectable` (≤3). NIK manual diverifikasi secara lokal dan melalui `attendee-checks`; NIK akun tidak tersedia ke FE, jadi BE tetap authoritative untuk link akun, duplikat, dan kuota. `NIK_NOT_LINKED` menawarkan input manual. `DEPENDENCY_UNAVAILABLE` retry memakai Idempotency-Key yang sama.
- **Fast-track (opsional):** profil login dapat prefill nama/email dan memberi masked NIK serta `hasNik`; user tetap memilih manual atau saved-NIK. Guest hanya mengisi manual.
- **Tombol "Kembali"** memunculkan **dialog konfirmasi** ("tinggalkan halaman? sesi dilepas & harus mengulang antrean") sebelum benar-benar keluar — perilaku UX murni, **tidak butuh perubahan contract**.
- **Subtitle kategori** dan **phone number** tidak ada di contract.

### 4.5 `payment.html` — Pembayaran
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `GET /api/v1/payments/{bookingId}/page` (Payment) | View-model halaman bayar | `methods[]`, `amountMinor`, `paymentExpiresAt`, `serverTime`, `currentAttempt?`, `canEdit`, `editableUntil` |
| 1m | `POST /api/v1/payments/{bookingId}/page-tokens` → `POST /api/v1/payment-page-sessions` | (Mobile WebView, bila diperlukan) tukar `pageToken` → set cookie `rb_pay` | `PageToken{pageToken, pageUrl, expiresAt}` |
| 2 | `POST /api/v1/payments/{bookingId}/attempts` (Payment, **Idempotency-Key wajib**) | Buat attempt SNAP untuk metode terpilih | body `{method}`; respons `Attempt{attemptNo, method, status, bookingVersion, expiresAt, redirectUrl, successReturnUrl, failedReturnUrl}` |
| 3 | `GET /api/v1/payments/{bookingId}/status` (Payment) | Verifikasi hasil setelah SNAP redirect/callback | `bookingStatus`, `orderId`, `paymentExpiresAt`, `attempt.status` (`CREATED|PENDING|SUCCEEDED|FAILED|EXPIRED|...`) |
| ± | `PUT /api/v1/bookings/{bookingId}/items` (Booking, **Idempotency-Key**, optimistic lock `version`) | Ubah pesanan selama masih `canEdit` | body `{version, items[]}` |

**NOTE:** SNAP adalah payment provider. FE tidak mengumpulkan data kartu atau menyelesaikan pembayaran.
BE membuat attempt lalu mengembalikan `redirectUrl`; FE mengarahkan user ke SNAP. SNAP mengembalikan
user ke `successReturnUrl` atau `failedReturnUrl`, tetapi FE tetap memanggil endpoint status untuk
memastikan hasil. Field redirect dan return URL sudah didefinisikan pada Payment OpenAPI; implementasi
provider dan konfigurasi URL tetap menjadi tanggung jawab BE.

### 4.6 `success.html` — Sukses
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `GET /api/v1/payments/{bookingId}/status` (Payment) | Konfirmasi `bookingStatus = PAID` | `bookingStatus`, `attempt.status = SUCCEEDED` |
| 2 | `GET /api/v1/bookings/{bookingId}` (Booking) | Ambil ringkasan order | `orderId/publicRef`, `amountMinor`, `ticketQuantity`, `buyerNikMasked`, `items[]` |
| 3 | `GET /api/v1/bookings/{bookingId}/tickets` (Booking) | Ambil e-tiket + QR + summary fields | `orderId`, `publicRef`, `amountMinor`, `ticketQuantity`, `buyerNikMasked`, `tickets[]{ticketCode, categoryCode, attendeeName, attendeeNikMasked, qrPayload}` |

**NOTE:** FE memverifikasi status `PAID` setelah callback sebelum mengambil tiket. Email e-tiket dikirim backend
(bukan endpoint FE). Ticket link via query `?t=`.

### 4.7 `expired.html` — Kedaluwarsa / Gagal
| # | Method & Path | Tujuan | Field utama dipakai |
|---|---|---|---|
| 1 | `GET /api/v1/bookings/{bookingId}` (Booking, bila ada booking) | Cek status akhir (`EXPIRED`/`CANCELLED`) | `status`, `lockReason` |
| 1' | `GET /api/v1/payments/{bookingId}/status` (Payment, bila ada booking) | Verifikasi expired atau SNAP failed callback | `bookingStatus`, `orderId`, `attempt.status = EXPIRED|FAILED` |

**NOTE:** "expired" dapat berasal dari TTL booking (`paymentExpiresAt`) atau sesi (`SESSION_EXPIRED`). Email "expired" dikirim backend via event, bukan endpoint FE.

---

## 5. Catatan Alur Penting

1. **Antrean ANONIM; `buyerNik` + `email` dikumpulkan di `detail.html`.** Keputusan terbaru: user diprioritaskan **masuk antrean dulu tanpa input apa pun**. NIK pembeli + email **tidak lagi** diminta saat join queue — dipindah ke tahap checkout (`detail.html`). Konsekuensi contract: `JoinRequest` yang sekarang mewajibkan `buyerNik`+`email`+`emailConfirmation`+`consentNik` perlu disesuaikan. **FE NEED THIS / PERUBAHAN CONTRACT:** `JoinRequest` dibuat **opsional/anonim** (tanpa NIK/email) atau join tanpa body; NIK/email dipindah ke tahap booking/detail (set-buyer pada sesi atau body `POST /bookings`).
2. **`buyerNik` (pembeli) terpisah dari NIK penumpang (`attendee.nik`).** Kuota `maxTicketsPerBuyerNik` divalidasi atas `buyerNik`; identitas tiap tiket memakai `attendee.nik` + `attendee.fullName`. Pembeli bisa menjadi salah satu penumpang via checkbox **"Gunakan NIK pembeli (pembeli ikut nonton)"** di `detail.html` → `attendee.nik = buyerNik` & `attendee.fullName = nama pembeli` otomatis. Checkbox **single-use**: hanya boleh di **satu** tiket (NIK pembeli unik) sehingga tak memicu `ATTENDEE_NIK_DUPLICATE_IN_ORDER`. Pemisahan `buyerNik` vs `attendee.nik` tetap dipertahankan meski pengumpulan `buyerNik` berpindah ke detail.
3. **Rantai token: AUTO-`claim` → `admissionToken` (TTL 60s) → `booking-session`, lalu AUTO-REDIRECT.** Setelah `ADMITTED`, FE **otomatis** memanggil `claim` (tanpa tombol manual) untuk mendapat `admissionToken` sekali pakai, menukarnya di `POST /booking-sessions`, lalu **auto-redirect** ke detail. Token kedaluwarsa/dipakai ulang → `ADMISSION_TOKEN_INVALID`/`TURN_MISSED`.
4. **SNAP redirect/callback.** Setelah `POST /payments/{bookingId}/attempts`, BE mengembalikan `redirectUrl`. FE mengarahkan user ke SNAP. SNAP mengembalikan user ke success atau failed URL; kedua halaman memverifikasi status BE sebelum menampilkan hasil. Webhook provider tetap backend-only.
5. **WebView mobile opsional.** Bila integrasi mobile membutuhkan payment page session, mobile menukar `pageToken` menjadi cookie `rb_pay`; itu tidak mengubah aturan status payment.
6. **Timer bersifat server-authoritative.** Semua hitung mundur (sesi, `paymentExpiresAt`, `claimDeadline`) dihitung dari `serverTime` + deadline absolut untuk mengoreksi clock-skew. Saat timer nol, FE melakukan satu final status check. Interval polling antrean diatur server (`nextPollAfterMs`, `poll{...}`).
7. **Ubah pesanan pakai optimistic lock.** `PUT /bookings/{id}/items` wajib mengirim `version` terakhir; konflik → `BOOKING_VERSION_CONFLICT`. Dibatasi `editsRemaining`/`editableUntil`/`canEdit`.
8. **Idempotency.** `POST /bookings`, `PUT /bookings/{id}/items`, `POST /payments/{id}/attempts` wajib `Idempotency-Key` (16–64 char) yang dipakai ulang saat retry.
9. **Registrasi eksplisit untuk email baru (opsional).** Entri login/daftar ada di **landing** ("Masuk / Daftar"): email → OTP (demo `123456`) → `verify`. Email **LAMA** → langsung login. Email **BARU** → langkah registrasi: isi `fullName` + `nik` (16 digit) dengan email read-only (untuk e-tiket) → `PATCH /me` menyimpan profil (prototype: mock `completeRegistration`), diakhiri **pop-up "Pendaftaran Berhasil"**. Nama + NIK + email ini lalu **auto-fill** di `detail.html`. Karena `verify` (`TokenResponse`) tak membawa flag kelengkapan profil, FE menentukan perlu-tidaknya langkah registrasi via `GET /me` (`hasNik`/`fullName`) — lihat **FE NEED THIS** di §3 & §6.

---

## 6. Daftar Gap & Rekomendasi (Prioritas)

Prioritas: **P0** = memblok alur inti / keputusan produk mendesak · **P1** = penting untuk kelengkapan layar · **P2** = nice-to-have / opsional.

| Prio | Gap | Dampak | Rekomendasi |
|---|---|---|---|
| **Resolved in live runtime; schema docs pending** | **`description` JSON terstruktur** dan event media detail. | Isi bagian tentang, pengisi acara, lokasi, galeri, S&K, dan hero/banner. | Live response has `longDesc`, `lineup`, `location`, `gallery`, `terms`, and event media URLs; FE parser consumes them. BE should publish the shape in the 07-11 OpenAPI/Markdown contract before FE regenerates types. |
| **P0** | **FE NEED THIS / PERUBAHAN CONTRACT** — `JoinRequest` **anonim**. Saat ini mewajibkan `buyerNik`+`email`+`emailConfirmation`+`consentNik`. | Keputusan baru: antrean anonim (masuk dulu tanpa input). | Buat `JoinRequest` **opsional** (tanpa NIK/email) atau izinkan join **tanpa body**; pindahkan NIK/email ke tahap booking/detail. |
| **P0** | **FE NEED THIS** — **set-buyer pada sesi**. Contract belum punya tempat menaruh `buyerNik`+`email` pada booking-session. | NIK/email pembeli kini diisi di `detail.html` tapi tak ada target field. | Usulan `POST /booking-sessions/{sessionId}/buyer { buyerNik, email }` **atau** sertakan `buyerNik`+`email` di body `POST /bookings`. Prototype memakai mock `setBuyer`. |
| **P0** | **FE NEED THIS / PERUBAHAN CONTRACT** — idempotency untuk queue join/claim. | Queue `503 DEPENDENCY_UNAVAILABLE` menyuruh FE retry dengan key yang sama, tetapi OpenAPI queue belum mendefinisikan `Idempotency-Key` pada join/claim. V5 tidak dapat membuktikan retry-safe behavior untuk queue. | Tambahkan header, aturan rekonsiliasi response, dan retention policy; atau hapus instruksi retry-key dari error contract dan definisikan query pemulihan yang jelas. |
| **P1** | **FE NEED THIS** — **indikator profil lengkap** pada respons `POST /auth/otp/verify` (atau andalkan `GET /me.hasNik`). | FE perlu tahu apakah email yang baru verify adalah **akun baru** yang masih harus melengkapi **nama + NIK** (langkah registrasi) atau akun lama yang langsung login. `TokenResponse` saat ini tak membawa flag `isNew`/profil-lengkap. | Jangka pendek: setelah `verify`, FE panggil `GET /me`; bila `hasNik=false`/`fullName` kosong → tampilkan form lengkapi profil → `PATCH /me {fullName, nik}`. Jangka menengah: tambahkan indikator (mis. `account.profileComplete`/`isNew`) pada respons `verify` agar hemat satu *round-trip*. Prototype memakai `isNew` di mock `verifyOtp` + `completeRegistration`. |
| **Resolved (contract update)** | **SNAP redirect URL dan callback return contract** | FE perlu membuka payment provider setelah membuat attempt dan memverifikasi success/failed callback. | `Attempt` kini mendefinisikan `redirectUrl`, `successReturnUrl`, `failedReturnUrl`, dan `expiresAt`; `PaymentStatus` membawa `paymentExpiresAt`. FE tidak menangani kartu atau settlement. |
| **P1** | **FE NEED THIS** — `remainingTickets` (integer) di **`EventSummary`** (level list). | Card landing wajib menampilkan jumlah tiket tersedia & badge "Stok Menipis" (perlu ambang angka). | Tambah `remainingTickets` ke `EventSummary`. Prototype memakai mock `remainingTickets`. |
| **P1** | **FE NEED THIS** — catalog filter contract untuk V5: `genre`, `province`, `time`, `sort`, pagination, dan field genre/lokasi terstruktur. | Browse V5 memakai URL `genre`, `province`, `time`, `sort`; Home juga membutuhkan event terdekat dan History Event. | Jangka pendek: filter/sort **client-side** dari list penuh dengan batas ukuran yang disetujui. Jangka menengah: tambah query params server-side; **arsip history** idealnya `GET /events?filter=past` atau endpoint arsip. |
| **Resolved in contract/runtime** | **Event image URLs** on summary/detail. | Card catalog and event hero use official event media. | The 07-11 contract includes optional `imageUrl`, `bannerUrl`, and `thumbnailUrl`; FE maps them and uses a fallback when absent. |
| **P1** | **History Event** publik (seksi landing menggantikan "Selling Fast"). | Seksi "History Event" butuh data event lampau. | Jangka pendek: turunkan **client-side** dari `status CLOSED`/`startsAt < serverTime`, sort desc. Jangka menengah: **FE NEED THIS** `GET /events?filter=past`/endpoint arsip + `sort`/`limit`. |
| **P1** | **Phone number** data reservation tidak disimpan contract. | Field telepon di checkout tak punya target. | Hilangkan field telepon (kontak = email), **atau** usulkan penambahan ke PDF bila wajib secara bisnis. |
| **P2** | **Biaya layanan (service fee)** tidak ada di contract/PDF. | Breakdown harga tak bisa menampilkan fee. | Tampilkan `amountMinor` sebagai total tunggal; tambah field breakdown hanya bila PDF mengharuskan. |
| **P2** | **Subtitle kategori** tidak ada (hanya `name`, `code`). | "Subtitle" di `requirement.md` tak punya sumber. | Derivasi/konten statis FE, atau tambah field `description` pada kategori. |
| **P2** | **Status "LIVE"** tidak ada di enum `EventSummary.status`. | Label "live/upcoming" harus diturunkan. | Turunkan di FE dari `salesStartsAt`/`startsAt` vs `serverTime`; tidak perlu perubahan contract. |
| **P2** | **Nama pemesan untuk guest** tidak dikumpulkan terpisah. | Checkout guest tak punya "nama pemesan" selain nama penumpang. | Gunakan nama salah satu penumpang, atau prefill dari profil bila login (fast-track); tidak perlu field baru. |
| **Resolved (desain)** | Tanggal **DD MMM YYYY** di card. | — | Diderivasi FE dari `EventSummary.startsAt`; **tidak** butuh perubahan contract. |
| **Resolved (desain)** | **Fast-track auto-fill** nama/NIK/email saat login + **registrasi eksplisit** (nama+NIK). | — | Didukung User Service (`/auth/otp/*`, `GET /me`, `PATCH /me`). Registrasi akun baru = verify OTP + `PATCH /me {fullName, nik}` (pop-up sukses). Auto-fill di `detail.html`; login tetap opsional, entri di landing. |

---

*Disusun berdasarkan pembacaan langsung 5 file OpenAPI di `.genesis/docs/api-contract/`, dokumen requirement di `.genesis/requirement/`, dan **prototype V5** (`.genesis/prototype/Final/*`, acuan "current prototype"). Setiap endpoint pada §4 telah diverifikasi path, method, dan field-nya terhadap contract.*
