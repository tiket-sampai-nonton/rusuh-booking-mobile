---
title: 2. Queue Service API
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 2. Queue Service API

Waiting room publik. Kontrak normatif; ringkasan di SDD §4.6.1.

Base URLs:

# Authentication

* API Key (visitorCookie1)
    - Parameter Name: **rb_visitor**, in: cookie. Visitor token web (HttpOnly, Secure, SameSite=Lax)

* API Key (visitorHeader1)
    - Parameter Name: **X-Visitor-Token**, in: header. Visitor token mobile (secure storage)

- HTTP Authentication, scheme: bearer<br/>Access token User Service (login OTP, opsional).
Saat join queue (ADR-030) token hanya mengidentifikasi akun untuk dedup (satu entri aktif per akun);
claim NIK pada token tidak dipakai. NIK dan email pembeli diisi di halaman Booking.

# queue

<a id="opIdjoinQueue"></a>

## POST Masuk antrean (anonim untuk semua pembeli, ADR-030)

POST /api/v1/events/{eventId}/queue-entries

Join antrean anonim untuk semua pembeli (guest dan login, web dan app): tanpa NIK, email, atau consent.
Body tidak dibaca; klien lama yang masih mengirim buyerNik/email/consent ditoleransi, nilainya dibuang
(tidak disimpan, tidak masuk log). NIK dan email diisi di halaman Booking saat hold.

Identitas: visitor token (cookie HttpOnly `rb_visitor` di web, header `X-Visitor-Token` di app) dan,
opsional, `Authorization: Bearer` (access token User Service). Bearer hanya mengidentifikasi akun untuk dedup;
claim NIK pada token diabaikan. Satu entri aktif per visitor dan per akun.
- Token valid milik entri aktif: 200 dengan entri itu (tidak membuat entri kedua).
- Bearer dengan akun yang sudah punya entri aktif dan tanpa token valid: 200 (re-attach) dengan entri akun itu
  dan visitor token baru untuk perangkat ini. Token yang menunjuk entri AKUN LAIN diabaikan.
- Bearer + token entri anonim lain sementara akun sudah punya entri aktif: 409 `ACCOUNT_ALREADY_IN_QUEUE`.
- `Idempotency-Key` (16..64 karakter) opsional: replay mengembalikan entri yang sama (200).
Bila tidak ada pengantre lebih awal dan slot tersedia, respons langsung ADMITTED (FR-05); Booking mereservasi
hingga 3 unit untuk event (jaminan kuantitas, bukan kategori) tanpa NIK pembeli.
Semua join FIFO ketat atas seq (jendela acak pembukaan/undian DIBUANG — ADR-030 Amandemen 2026-11-05).

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|
|X-Request-ID|header|string| no |Diteruskan antar service; dibuat bila kosong|
|Idempotency-Key|header|string| no |Replay dengan key yang sama (scope akun, visitor, atau anonim) mengembalikan entri yang sama|
|X-Visitor-Token|header|string| no |Visitor token (app). Web memakai cookie HttpOnly `rb_visitor`.|
|X-Device-Id|header|string| no |Id acak per instalasi/profil browser. Hanya HMAC-nya yang masuk ke token; bukan kontrol bot.|
|body|body|[JoinRequest](#schemajoinrequest)| no |none|

> Response Examples

> 200 Response

```json
{
  "meta": {
    "code": 0,
    "message": "string",
    "requestId": "string",
    "errorCode": "string",
    "details": {
      "property1": "string",
      "property2": "string"
    }
  },
  "data": {
    "entryId": "09a8b554-45ca-4bab-a638-265db4b3e828",
    "seq": 0,
    "status": "WAITING",
    "state": "WAITING",
    "rank": 0,
    "queueToken": "string",
    "visitorToken": "string",
    "statusUrl": "string",
    "claimDeadline": "2019-08-24T14:15:22Z",
    "joinedAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Entri aktif yang sudah ada dikembalikan (token valid, re-attach akun, atau replay Idempotency-Key)|Inline|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Masuk antrean (WAITING) atau langsung ADMITTED|Inline|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Konflik antrean — errorCode: `ACCOUNT_ALREADY_IN_QUEUE`, `EVENT_NOT_ON_SALE`|[ErrorEnvelope](#schemaerrorenvelope)|
|410|[Gone](https://tools.ietf.org/html/rfc7231#section-6.5.9)|Tiket habis — errorCode: `EVENT_SOLD_OUT`|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Batas lunak per IP terlampaui (lihat header Retry-After; bukan blokir permanen karena NAT seluler) — errorCode: `RATE_LIMITED`|[ErrorEnvelope](#schemaerrorenvelope)|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Dependency sementara tidak tersedia; ulangi dengan Idempotency-Key yang sama — errorCode: `DEPENDENCY_UNAVAILABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|[QueueEntry](#schemaqueueentry)|true|none||none|
|»» entryId|string(uuid)|true|none||none|
|»» seq|integer|true|none||none|
|»» status|string|true|none||none|
|»» state|string|false|none||Status klien (ADR-030; draw dibuang pada Amandemen 2026-11-05). STALE = heartbeat senyap.|
|»» rank|integer¦null|false|none||Urutan admisi (FIFO ketat atas seq; ADR-030 Amandemen 2026-11-05). null saat ENDED.|
|»» queueToken|string|false|none||none|
|»» visitorToken|string|false|none||Hanya untuk mobile (web: cookie HttpOnly). Selalu untuk generasi token TERKINI; rotasi (re-attach akun,<br />join ulang setelah entri berakhir) mencabut token lama (heartbeat/me lama -> 401 VISITOR_TOKEN_INVALID).<br />Bila request membawa X-Device-Id, token terikat ke HMAC-nya.|
|»» statusUrl|string|false|none||none|
|»» claimDeadline|string(date-time)|false|none||none|
|»» joinedAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|WAITING|
|status|ADMITTED|
|status|CLAIMED|
|status|MISSED|
|status|LEFT|
|status|SOLD_OUT|
|status|CLOSED|
|status|COMPLETED|
|status|ENDED|
|status|STALE|
|state|WAITING|
|state|STALE|
|state|ADMITTED|
|state|CLAIMED|
|state|ENDED|

HTTP Status Code **201**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|[QueueEntry](#schemaqueueentry)|true|none||none|
|»» entryId|string(uuid)|true|none||none|
|»» seq|integer|true|none||none|
|»» status|string|true|none||none|
|»» state|string|false|none||Status klien (ADR-030; draw dibuang pada Amandemen 2026-11-05). STALE = heartbeat senyap.|
|»» rank|integer¦null|false|none||Urutan admisi (FIFO ketat atas seq; ADR-030 Amandemen 2026-11-05). null saat ENDED.|
|»» queueToken|string|false|none||none|
|»» visitorToken|string|false|none||Hanya untuk mobile (web: cookie HttpOnly). Selalu untuk generasi token TERKINI; rotasi (re-attach akun,<br />join ulang setelah entri berakhir) mencabut token lama (heartbeat/me lama -> 401 VISITOR_TOKEN_INVALID).<br />Bila request membawa X-Device-Id, token terikat ke HMAC-nya.|
|»» statusUrl|string|false|none||none|
|»» claimDeadline|string(date-time)|false|none||none|
|»» joinedAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|WAITING|
|status|ADMITTED|
|status|CLAIMED|
|status|MISSED|
|status|LEFT|
|status|SOLD_OUT|
|status|CLOSED|
|status|COMPLETED|
|status|ENDED|
|status|STALE|
|state|WAITING|
|state|STALE|
|state|ADMITTED|
|state|CLAIMED|
|state|ENDED|

HTTP Status Code **409**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **410**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **429**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **503**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

<a id="opIdgetQueueStatus"></a>

## GET Status Document (CDN, 1 detik)

GET /api/v1/queue-status/{eventId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|

> Response Examples

> 200 Response

```json
{
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "saleState": "NOT_STARTED",
  "headSeq": 0,
  "guaranteedUntilSeq": 0,
  "possibleUntilSeq": 0,
  "soldOut": true,
  "remainingTickets": 0,
  "admissionRatePerMin": 0,
  "removedBuckets": {
    "size": 0,
    "fromSeq": 0,
    "counts": [
      0
    ]
  },
  "nextPollAfterMs": 0,
  "poll": {
    "farMs": 0,
    "midMs": 0,
    "nearMs": 0,
    "farAbove": 0,
    "midAbove": 0
  },
  "preTurnNotifyPosition": 0,
  "categories": [
    {
      "code": "string",
      "name": "string",
      "state": "AVAILABLE"
    }
  ],
  "updatedAt": "2019-08-24T14:15:22Z"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Status Document|[StatusDocument](#schemastatusdocument)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Event tidak ada — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

<a id="opIdgetMyEntry"></a>

## GET Posisi eksak (saat dekat giliran)

GET /api/v1/queue-entries/me

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|query|string(uuid)| yes |none|

> Response Examples

> 200 Response

```json
{
  "meta": {
    "code": 0,
    "message": "string",
    "requestId": "string",
    "errorCode": "string",
    "details": {
      "property1": "string",
      "property2": "string"
    }
  },
  "data": {
    "entryId": "09a8b554-45ca-4bab-a638-265db4b3e828",
    "seq": 0,
    "status": "string",
    "state": "WAITING",
    "rank": 0,
    "exactPosition": 0,
    "zone": "GUARANTEED",
    "nextHeartbeatMs": 0,
    "claimDeadline": "2019-08-24T14:15:22Z",
    "reason": "LEFT",
    "redirect": "string"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid, kedaluwarsa, sudah dirotasi, atau perangkat tidak cocok — errorCode: `VISITOR_TOKEN_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Visitor tidak pernah punya entri untuk event ini — errorCode: `NOT_FOUND`. Entri yang sudah berakhir dijawab 200 dengan state ENDED dan reason.|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Terlalu banyak request (lihat header Retry-After) — errorCode: `RATE_LIMITED`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|[EntryStatus](#schemaentrystatus)|true|none||none|
|»» entryId|string(uuid)|true|none||none|
|»» seq|integer|true|none||none|
|»» status|string|true|none||Status tersimpan (mentah)|
|»» state|string|true|none||Status klien (ADR-030; draw dibuang pada Amandemen 2026-11-05). STALE = heartbeat senyap.|
|»» rank|integer¦null|true|none||Urutan admisi (FIFO ketat atas seq; ADR-030 Amandemen 2026-11-05). null saat ENDED.|
|»» exactPosition|integer|false|none||1 + jumlah entri hidup (WAITING, bukan STALE) dengan seq lebih kecil|
|»» zone|string¦null|true|none||Dihitung server dari seq (otoritatif). null saat ADMITTED/CLAIMED atau ENDED.|
|»» nextHeartbeatMs|integer|false|none||Interval heartbeat berikutnya (±20% jitter; lebih pendek dekat head)|
|»» claimDeadline|string(date-time)|false|none||none|
|»» reason|string|false|none||Hanya untuk state ENDED (adendum 2)|
|»» redirect|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|state|WAITING|
|state|STALE|
|state|ADMITTED|
|state|CLAIMED|
|state|ENDED|
|zone|GUARANTEED|
|zone|POSSIBLE|
|zone|NOT_ENOUGH|
|zone|null|
|reason|LEFT|
|reason|STALE_TIMEOUT|
|reason|CLAIM_WINDOW_EXPIRED|
|reason|PAGE_TIMER_EXPIRED|
|reason|JOURNEY_ENDED|

HTTP Status Code **401**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **404**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **429**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

<a id="opIdclaimTurn"></a>

## POST Ambil admission token saat giliran tiba

POST /api/v1/queue-entries/{entryId}/claim

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|entryId|path|string(uuid)| yes |none|
|eventId|query|string(uuid)| yes |Event dari entri antrean; entri dicari per event.|

> Response Examples

> 200 Response

```json
{
  "meta": {
    "code": 0,
    "message": "string",
    "requestId": "string",
    "errorCode": "string",
    "details": {
      "property1": "string",
      "property2": "string"
    }
  },
  "data": {
    "admissionToken": "string",
    "bookingUrl": "string"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor dirotasi (generasi lama) — errorCode: `VISITOR_TOKEN_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Entry tidak ditemukan, bukan milik visitor ini, atau sudah selesai (LEFT/ENDED/COMPLETED) — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Entry masih WAITING dan belum mendapat giliran — errorCode: `NOT_ADMITTED`|[ErrorEnvelope](#schemaerrorenvelope)|
|410|[Gone](https://tools.ietf.org/html/rfc7231#section-6.5.9)|Giliran terlewat atau tiket habis — errorCode: `TURN_MISSED`, `EVENT_SOLD_OUT`|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Terlalu banyak request (lihat header Retry-After) — errorCode: `RATE_LIMITED`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|[ClaimResponse](#schemaclaimresponse)|true|none||none|
|»» admissionToken|string|true|none||Sekali pakai, TTL 60 detik|
|»» bookingUrl|string|true|none||none|

HTTP Status Code **401**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **404**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **409**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **410**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **429**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

<a id="opIdleaveQueue"></a>

## DELETE Keluar dari antrean (SHOULD)

DELETE /api/v1/queue-entries/{entryId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|entryId|path|string(uuid)| yes |none|
|eventId|query|string(uuid)| yes |Event dari entri antrean; entri dicari per event.|

> Response Examples

> 401 Response

```json
{
  "meta": {
    "code": 0,
    "message": "string",
    "requestId": "string",
    "errorCode": "string",
    "details": {
      "property1": "string",
      "property2": "string"
    }
  },
  "data": null
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Keluar; slot tidak dipakai lagi|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor dirotasi (generasi lama) — errorCode: `VISITOR_TOKEN_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada entry — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

<a id="opIdheartbeat"></a>

## POST Sinyal hidup entri (ADR-030)

POST /api/v1/queue-entries/me/heartbeat

Dikirim klien pada interval `nextHeartbeatMs` selama WAITING/STALE. Entri yang senyap lebih dari
stale_after (90 dtk) menjadi STALE (dilewati promotor, seq tetap) dan hidup kembali pada heartbeat berikutnya
di seq aslinya; senyap lebih dari end_after (300 dtk) tanpa admisi -> ENDED (STALE_TIMEOUT). Tanpa body;
tanpa data pribadi.

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|query|string(uuid)| yes |none|
|X-Device-Id|header|string| no |Wajib bila token diterbitkan dengan X-Device-Id|

> Response Examples

> 200 Response

```json
{
  "meta": {
    "code": 0,
    "message": "string",
    "requestId": "string",
    "errorCode": "string",
    "details": {
      "property1": "string",
      "property2": "string"
    }
  },
  "data": {
    "entryId": "09a8b554-45ca-4bab-a638-265db4b3e828",
    "state": "WAITING",
    "rank": 0,
    "nextHeartbeatMs": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak valid/dirotasi/perangkat tidak cocok — errorCode: `VISITOR_TOKEN_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Token valid, entri sudah berakhir — errorCode: `ENTRY_NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Heartbeat melebihi batas per visitor (RATE_LIMIT_HEARTBEAT_PER_VISITOR per menit; lihat Retry-After) — errorCode: `RATE_LIMITED`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|[HeartbeatStatus](#schemaheartbeatstatus)|true|none||none|
|»» entryId|string(uuid)|false|none||none|
|»» state|string|true|none||none|
|»» rank|integer¦null|true|none||none|
|»» nextHeartbeatMs|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|state|WAITING|
|state|ADMITTED|
|state|CLAIMED|

HTTP Status Code **401**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **404**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

HTTP Status Code **429**

*Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|null|true|none||none|

# ops

<a id="opIdhealth"></a>

## GET Health (ALB dan HEALTHCHECK container, D-23)

GET /health

> Response Examples

> 200 Response

```json
{
  "status": "UP",
  "service": "string",
  "checkedAt": "2019-08-24T14:15:22Z",
  "dependencies": [
    {
      "name": "string",
      "status": "UP",
      "latencyMs": 0,
      "reason": "string"
    }
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Semua dependency UP|[Health](#schemahealth)|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Ada dependency DOWN|[Health](#schemahealth)|

# Data Schema

<h2 id="tocS_Meta">Meta</h2>

<a id="schemameta"></a>
<a id="schema_Meta"></a>
<a id="tocSmeta"></a>
<a id="tocsmeta"></a>

```json
{
  "code": 0,
  "message": "string",
  "requestId": "string",
  "errorCode": "string",
  "details": {
    "property1": "string",
    "property2": "string"
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|code|integer|true|none||none|
|message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|» **additionalProperties**|string|false|none||none|

<h2 id="tocS_ErrorEnvelope">ErrorEnvelope</h2>

<a id="schemaerrorenvelope"></a>
<a id="schema_ErrorEnvelope"></a>
<a id="tocSerrorenvelope"></a>
<a id="tocserrorenvelope"></a>

```json
{
  "meta": {
    "code": 0,
    "message": "string",
    "requestId": "string",
    "errorCode": "string",
    "details": {
      "property1": "string",
      "property2": "string"
    }
  },
  "data": null
}

```

Error envelope SRS §3.1.4. Tidak pernah memuat SQL, stack trace, secret, atau payload provider.

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|meta|[Meta](#schemameta)|true|none||none|
|data|null|true|none||none|

<h2 id="tocS_Health">Health</h2>

<a id="schemahealth"></a>
<a id="schema_Health"></a>
<a id="tocShealth"></a>
<a id="tocshealth"></a>

```json
{
  "status": "UP",
  "service": "string",
  "checkedAt": "2019-08-24T14:15:22Z",
  "dependencies": [
    {
      "name": "string",
      "status": "UP",
      "latencyMs": 0,
      "reason": "string"
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|status|string|true|none||none|
|service|string|true|none||none|
|checkedAt|string(date-time)|true|none||none|
|dependencies|[object]|true|none||none|
|» name|string|true|none||none|
|» status|string|true|none||none|
|» latencyMs|integer|false|none||none|
|» reason|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|status|UP|
|status|DOWN|
|status|UP|
|status|DOWN|

<h2 id="tocS_JoinRequest">JoinRequest</h2>

<a id="schemajoinrequest"></a>
<a id="schema_JoinRequest"></a>
<a id="tocSjoinrequest"></a>
<a id="tocsjoinrequest"></a>

```json
{}

```

Join anonim (ADR-030): tidak ada field yang dibaca. buyerNik, email, emailConfirmation, dan consentNik
sudah dihapus dari kontrak; klien lama yang masih mengirimnya ditoleransi dan nilainya dibuang.
Tidak ada field challenge/bot token: pemeriksaan bot di sisi klien tidak dibangun (keputusan pemilik).

### Attribute

*None*

<h2 id="tocS_QueueEntry">QueueEntry</h2>

<a id="schemaqueueentry"></a>
<a id="schema_QueueEntry"></a>
<a id="tocSqueueentry"></a>
<a id="tocsqueueentry"></a>

```json
{
  "entryId": "09a8b554-45ca-4bab-a638-265db4b3e828",
  "seq": 0,
  "status": "WAITING",
  "state": "WAITING",
  "rank": 0,
  "queueToken": "string",
  "visitorToken": "string",
  "statusUrl": "string",
  "claimDeadline": "2019-08-24T14:15:22Z",
  "joinedAt": "2019-08-24T14:15:22Z",
  "serverTime": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|entryId|string(uuid)|true|none||none|
|seq|integer|true|none||none|
|status|string|true|none||none|
|state|string|false|none||Status klien (ADR-030; draw dibuang pada Amandemen 2026-11-05). STALE = heartbeat senyap.|
|rank|integer¦null|false|none||Urutan admisi (FIFO ketat atas seq; ADR-030 Amandemen 2026-11-05). null saat ENDED.|
|queueToken|string|false|none||none|
|visitorToken|string|false|none||Hanya untuk mobile (web: cookie HttpOnly). Selalu untuk generasi token TERKINI; rotasi (re-attach akun,<br />join ulang setelah entri berakhir) mencabut token lama (heartbeat/me lama -> 401 VISITOR_TOKEN_INVALID).<br />Bila request membawa X-Device-Id, token terikat ke HMAC-nya.|
|statusUrl|string|false|none||none|
|claimDeadline|string(date-time)|false|none||none|
|joinedAt|string(date-time)|true|none||none|
|serverTime|string(date-time)|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|WAITING|
|status|ADMITTED|
|status|CLAIMED|
|status|MISSED|
|status|LEFT|
|status|SOLD_OUT|
|status|CLOSED|
|status|COMPLETED|
|status|ENDED|
|status|STALE|
|state|WAITING|
|state|STALE|
|state|ADMITTED|
|state|CLAIMED|
|state|ENDED|

<h2 id="tocS_EntryStatus">EntryStatus</h2>

<a id="schemaentrystatus"></a>
<a id="schema_EntryStatus"></a>
<a id="tocSentrystatus"></a>
<a id="tocsentrystatus"></a>

```json
{
  "entryId": "09a8b554-45ca-4bab-a638-265db4b3e828",
  "seq": 0,
  "status": "string",
  "state": "WAITING",
  "rank": 0,
  "exactPosition": 0,
  "zone": "GUARANTEED",
  "nextHeartbeatMs": 0,
  "claimDeadline": "2019-08-24T14:15:22Z",
  "reason": "LEFT",
  "redirect": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|entryId|string(uuid)|true|none||none|
|seq|integer|true|none||none|
|status|string|true|none||Status tersimpan (mentah)|
|state|string|true|none||Status klien (ADR-030; draw dibuang pada Amandemen 2026-11-05). STALE = heartbeat senyap.|
|rank|integer¦null|true|none||Urutan admisi (FIFO ketat atas seq; ADR-030 Amandemen 2026-11-05). null saat ENDED.|
|exactPosition|integer|false|none||1 + jumlah entri hidup (WAITING, bukan STALE) dengan seq lebih kecil|
|zone|string¦null|true|none||Dihitung server dari seq (otoritatif). null saat ADMITTED/CLAIMED atau ENDED.|
|nextHeartbeatMs|integer|false|none||Interval heartbeat berikutnya (±20% jitter; lebih pendek dekat head)|
|claimDeadline|string(date-time)|false|none||none|
|reason|string|false|none||Hanya untuk state ENDED (adendum 2)|
|redirect|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|state|WAITING|
|state|STALE|
|state|ADMITTED|
|state|CLAIMED|
|state|ENDED|
|zone|GUARANTEED|
|zone|POSSIBLE|
|zone|NOT_ENOUGH|
|zone|null|
|reason|LEFT|
|reason|STALE_TIMEOUT|
|reason|CLAIM_WINDOW_EXPIRED|
|reason|PAGE_TIMER_EXPIRED|
|reason|JOURNEY_ENDED|

<h2 id="tocS_ClaimResponse">ClaimResponse</h2>

<a id="schemaclaimresponse"></a>
<a id="schema_ClaimResponse"></a>
<a id="tocSclaimresponse"></a>
<a id="tocsclaimresponse"></a>

```json
{
  "admissionToken": "string",
  "bookingUrl": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|admissionToken|string|true|none||Sekali pakai, TTL 60 detik|
|bookingUrl|string|true|none||none|

<h2 id="tocS_HeartbeatStatus">HeartbeatStatus</h2>

<a id="schemaheartbeatstatus"></a>
<a id="schema_HeartbeatStatus"></a>
<a id="tocSheartbeatstatus"></a>
<a id="tocsheartbeatstatus"></a>

```json
{
  "entryId": "09a8b554-45ca-4bab-a638-265db4b3e828",
  "state": "WAITING",
  "rank": 0,
  "nextHeartbeatMs": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|entryId|string(uuid)|false|none||none|
|state|string|true|none||none|
|rank|integer¦null|true|none||none|
|nextHeartbeatMs|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|state|WAITING|
|state|ADMITTED|
|state|CLAIMED|

<h2 id="tocS_StatusDocument">StatusDocument</h2>

<a id="schemastatusdocument"></a>
<a id="schema_StatusDocument"></a>
<a id="tocSstatusdocument"></a>
<a id="tocsstatusdocument"></a>

```json
{
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "saleState": "NOT_STARTED",
  "headSeq": 0,
  "guaranteedUntilSeq": 0,
  "possibleUntilSeq": 0,
  "soldOut": true,
  "remainingTickets": 0,
  "admissionRatePerMin": 0,
  "removedBuckets": {
    "size": 0,
    "fromSeq": 0,
    "counts": [
      0
    ]
  },
  "nextPollAfterMs": 0,
  "poll": {
    "farMs": 0,
    "midMs": 0,
    "nearMs": 0,
    "farAbove": 0,
    "midAbove": 0
  },
  "preTurnNotifyPosition": 0,
  "categories": [
    {
      "code": "string",
      "name": "string",
      "state": "AVAILABLE"
    }
  ],
  "updatedAt": "2019-08-24T14:15:22Z"
}

```

Dokumen publik tanpa data pribadi; Cache-Control: public, max-age=1, stale-while-revalidate=2

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|eventId|string(uuid)|true|none||none|
|saleState|string|true|none||none|
|headSeq|integer¦null|false|none||Seq entri hidup terdepan (0 bila antrean kosong)|
|guaranteedUntilSeq|integer¦null|false|none||Seq entri hidup ke-G, G = ceil(stok bebas / 3); 0 = zona kosong.|
|possibleUntilSeq|integer¦null|false|none||Seq entri hidup ke-P, P = ceil((bebas + teralokasi + ditahan) / 3); 0 = zona kosong.|
|soldOut|boolean|true|none||none|
|remainingTickets|integer|false|none||none|
|admissionRatePerMin|integer|false|none||none|
|removedBuckets|object|false|none||none|
|» size|integer|false|none||none|
|» fromSeq|integer|false|none||none|
|» counts|[integer]|false|none||none|
|nextPollAfterMs|integer|false|none||none|
|poll|object|false|none||none|
|» farMs|integer|false|none||none|
|» midMs|integer|false|none||none|
|» nearMs|integer|false|none||none|
|» farAbove|integer|false|none||none|
|» midAbove|integer|false|none||none|
|preTurnNotifyPosition|integer|false|none||none|
|categories|[object]|false|none||none|
|» code|string|false|none||none|
|» name|string|false|none||none|
|» state|string|false|none||none|
|updatedAt|string(date-time)|true|none||none|

#### Enum

|Name|Value|
|---|---|
|saleState|NOT_STARTED|
|saleState|OPEN|
|saleState|CLOSED|
|state|AVAILABLE|
|state|LIMITED|
|state|SOLD_OUT|

