---
title: 3. Booking Service API
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

# 3. Booking Service API

Katalog event, sesi pilih, hold, ubah pesanan, e-tiket. Agregat Booking memakai event sourcing (ADR-019).

Base URLs:

# Authentication

* API Key (visitorCookie)
    - Parameter Name: **rb_visitor**, in: cookie. Visitor token web (HttpOnly, Secure, SameSite=Lax)

* API Key (visitorHeader)
    - Parameter Name: **X-Visitor-Token**, in: header. Visitor token mobile (secure storage)

- HTTP Authentication, scheme: bearer<br/>Access token User Service (login OTP, opsional)

* API Key (ticketLink)
    - Parameter Name: **t**, in: query. Ticket link token dari email e-tiket

# catalog

<a id="opIdlistEvents"></a>

## GET Daftar event dengan filter (cache 2 detik, SRS-F-28)

GET /api/v1/events

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|timeframe|query|string| no |Filter waktu (SRS-F-28-01)|
|city|query|string| no |Filter lokasi/kota (SRS-F-28-02)|
|genres|query|array[string]| no |Filter genre (SRS-F-28-04, US-015). Multi-nilai: ulangi param (`?genres=POP&genres=ROCK`) atau CSV (`?genres=POP,ROCK`). Cocok bila event punya salah satu genre (overlap); kosong = semua. Token dinormalisasi server (trim, uppercase, `-`/spasi -> `_`, dedupe). Maks 20 token, tiap token maks 64 karakter -- pelanggaran -> 400 VALIDATION_ERROR.|
|startDate|query|string(date)| no |Batas awal rentang tanggal (inklusif, zona WIB), format `YYYY-MM-DD` (SRS-F-28-04). Independen dari `timeframe`; bila keduanya diberikan hasilnya di-AND. Format salah -> 400 VALIDATION_ERROR.|
|endDate|query|string(date)| no |Batas akhir rentang tanggal (inklusif, zona WIB), format `YYYY-MM-DD` (SRS-F-28-04). `endDate` lebih awal dari `startDate` -> 400 VALIDATION_ERROR.|
|status|query|string| no |Filter status ketersediaan (SRS-F-28-03)|
|sort|query|string| no |Urutan hasil (SRS-F-28-06); tiebreaker eventId. Nilai tak dikenal -> default DATE_ASC (fail-soft)|

#### Enum

|Name|Value|
|---|---|
|timeframe|ALL|
|timeframe|THIS_WEEK|
|timeframe|THIS_MONTH|
|timeframe|UPCOMING|
|status|ALL|
|status|NOT_STARTED|
|status|AVAILABLE|
|status|SOLD_OUT|
|status|CLOSED|
|status|CANCELLED|
|sort|DATE_ASC|
|sort|DATE_DESC|
|sort|PRICE_ASC|
|sort|PRICE_DESC|

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
    "events": [
      {
        "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
        "slug": "string",
        "name": "string",
        "venue": "string",
        "startsAt": "2019-08-24T14:15:22Z",
        "salesStartsAt": "2019-08-24T14:15:22Z",
        "salesEndsAt": "2019-08-24T14:15:22Z",
        "status": "NOT_STARTED",
        "minPriceMinor": 0,
        "imageUrl": "string",
        "bannerUrl": "string",
        "thumbnailUrl": "string",
        "genres": [
          "string"
        ]
      }
    ],
    "serverTime": "2019-08-24T14:15:22Z"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Filter tidak valid: format `startDate`/`endDate` bukan YYYY-MM-DD, rentang terbalik (endDate < startDate), jumlah genre > 20, atau token genre > 64 karakter -- errorCode: `VALIDATION_ERROR`. Nilai enum tak dikenal TIDAK menyebabkan 400 (fail-soft ke default).|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[EventList](#schemaeventlist)|true|none||none|
|»» events|[[EventSummary](#schemaeventsummary)]|true|none||none|
|»»» eventId|string(uuid)|true|none||none|
|»»» slug|string|true|none||none|
|»»» name|string|true|none||none|
|»»» venue|string|false|none||none|
|»»» startsAt|string(date-time)|false|none||none|
|»»» salesStartsAt|string(date-time)|true|none||none|
|»»» salesEndsAt|string(date-time)|true|none||none|
|»»» status|string|true|none||none|
|»»» minPriceMinor|integer(int64)|false|none||Minor unit IDR|
|»»» imageUrl|string|false|none||URL gambar utama; tidak ada bila belum diunggah (API admin images)|
|»»» bannerUrl|string|false|none||URL banner (hero detail event); tidak ada bila belum diunggah|
|»»» thumbnailUrl|string|false|none||URL thumbnail kartu katalog; tidak ada bila belum diunggah|
|»»» genres|[string]|true|none||Genre event (SRS-F-28-04, US-015). Selalu array; `[]` bila kosong. Dinormalisasi uppercase. Dipakai filter query `genres` (overlap).|
|»» serverTime|string(date-time)|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|NOT_STARTED|
|status|AVAILABLE|
|status|SOLD_OUT|
|status|CLOSED|
|status|CANCELLED|

HTTP Status Code **400**

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

<a id="opIdgetEvent"></a>

## GET Detail event dan kategori (cache 2 detik)

GET /api/v1/events/{eventId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|

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
    "event": {
      "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
      "slug": "string",
      "name": "string",
      "venue": "string",
      "startsAt": "2019-08-24T14:15:22Z",
      "salesStartsAt": "2019-08-24T14:15:22Z",
      "salesEndsAt": "2019-08-24T14:15:22Z",
      "status": "NOT_STARTED",
      "minPriceMinor": 0,
      "imageUrl": "string",
      "bannerUrl": "string",
      "thumbnailUrl": "string",
      "genres": [
        "string"
      ]
    },
    "maxTicketsPerOrder": 0,
    "maxTicketsPerBuyerNik": 0,
    "allowMixedCategories": true,
    "published": true,
    "categories": [
      {
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "code": "string",
        "name": "string",
        "priceMinor": 0,
        "available": 0
      }
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Event tidak ada atau masih draf (belum diterbitkan) — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[EventDetail](#schemaeventdetail)|true|none||none|
|»» event|[EventSummary](#schemaeventsummary)|true|none||none|
|»»» eventId|string(uuid)|true|none||none|
|»»» slug|string|true|none||none|
|»»» name|string|true|none||none|
|»»» venue|string|false|none||none|
|»»» startsAt|string(date-time)|false|none||none|
|»»» salesStartsAt|string(date-time)|true|none||none|
|»»» salesEndsAt|string(date-time)|true|none||none|
|»»» status|string|true|none||none|
|»»» minPriceMinor|integer(int64)|false|none||Minor unit IDR|
|»»» imageUrl|string|false|none||URL gambar utama; tidak ada bila belum diunggah (API admin images)|
|»»» bannerUrl|string|false|none||URL banner (hero detail event); tidak ada bila belum diunggah|
|»»» thumbnailUrl|string|false|none||URL thumbnail kartu katalog; tidak ada bila belum diunggah|
|»»» genres|[string]|true|none||Genre event (SRS-F-28-04, US-015). Selalu array; `[]` bila kosong. Dinormalisasi uppercase. Dipakai filter query `genres` (overlap).|
|»» maxTicketsPerOrder|integer|false|none||none|
|»» maxTicketsPerBuyerNik|integer|false|none||none|
|»» allowMixedCategories|boolean|false|none||none|
|»» published|boolean|false|none||Selalu true di katalog publik (event draf menjawab 404). Draf hanya terlihat oleh admin.|
|»» categories|[object]|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» code|string|true|none||none|
|»»» name|string|true|none||none|
|»»» priceMinor|integer(int64)|true|none||Minor unit IDR|
|»»» available|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|NOT_STARTED|
|status|AVAILABLE|
|status|SOLD_OUT|
|status|CLOSED|
|status|CANCELLED|

HTTP Status Code **400**

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

<a id="opIdlistEventFacets"></a>

## GET Nilai filter tersedia (cities, genres) untuk katalog publik, drill-down mengikuti event list (cache 2 detik, SRS-F-28-02/04). Tiap facet menerapkan semua filter aktif kecuali dirinya sendiri.

GET /api/v1/events/facets

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|timeframe|query|string| no |Sama seperti GET /events. Diterapkan ke facet cities dan genres.|
|city|query|string| no |Diterapkan ke facet genres; diabaikan oleh facet cities (drill-down).|
|genres|query|array[string]| no |Multi-nilai (ulangi atau CSV). Diterapkan ke facet cities; diabaikan oleh facet genres (drill-down). Cap dan normalisasi sama dengan GET /events.|
|startDate|query|string(date)| no |Batas awal rentang tanggal (YYYY-MM-DD, inklusif WIB). Sama seperti GET /events.|
|endDate|query|string(date)| no |Batas akhir rentang tanggal (YYYY-MM-DD, inklusif WIB). Sama seperti GET /events.|
|status|query|string| no |Sama seperti GET /events. Diterapkan ke facet cities dan genres.|

#### Enum

|Name|Value|
|---|---|
|timeframe|ALL|
|timeframe|THIS_WEEK|
|timeframe|THIS_MONTH|
|timeframe|UPCOMING|
|status|ALL|
|status|NOT_STARTED|
|status|AVAILABLE|
|status|SOLD_OUT|
|status|CLOSED|
|status|CANCELLED|

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
    "cities": [
      "string"
    ],
    "genres": [
      "string"
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Filter tidak valid (format tanggal, rentang terbalik, atau cap genre) — errorCode: `VALIDATION_ERROR`. Identik dengan GET /events; nilai enum tak dikenal TIDAK 400 (fail-soft).|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[EventFacets](#schemaeventfacets)|true|none||Nilai filter yang tersedia lintas katalog publik (event terbit, non-cancelled).|
|»» cities|[string]|true|none||Daftar kota distinct (non-kosong), terurut. Selalu array ([] bila kosong).|
|»» genres|[string]|true|none||Daftar token genre distinct, terurut. Selalu array ([] bila kosong).|

HTTP Status Code **400**

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

# booking

<a id="opIdcreateSession"></a>

## POST Buat atau pulihkan sesi dari admission token

POST /api/v1/booking-sessions

> Body Parameters

```json
{
  "admissionToken": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CreateSessionRequest](#schemacreatesessionrequest)| yes |none|

> Response Examples

> 201 Response

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
    "sessionId": "f6567dd8-e069-418e-8893-7d22fcf12459",
    "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
    "phase": "SELECTING",
    "reason": "string",
    "outstandingUnits": 0,
    "reservedUnits": 0,
    "maxSelectable": 0,
    "buyerNikMasked": "3174********0001",
    "allowMixedCategories": true,
    "expiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "submitGraceSeconds": 0,
    "selectionWarningSeconds": 0,
    "editEnabled": true,
    "maxEdits": 0,
    "categories": [
      {
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "code": "string",
        "name": "string",
        "priceMinor": 0,
        "available": 0
      }
    ],
    "booking": {
      "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
      "publicRef": "RB-00912",
      "orderId": "RB-00912",
      "ticketQuantity": 1,
      "buyerNikMasked": "3174********0001",
      "status": "PENDING_PAYMENT",
      "amountMinor": 0,
      "currency": "IDR",
      "paymentExpiresAt": "2019-08-24T14:15:22Z",
      "serverTime": "2019-08-24T14:15:22Z",
      "version": 0,
      "canEdit": true,
      "editableUntil": "2019-08-24T14:15:22Z",
      "editsRemaining": 0,
      "lockReason": "PAYMENT_STARTED",
      "paymentPageUrl": "string",
      "items": [
        {
          "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
          "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
          "attendeeNikMasked": "3174********0001",
          "attendeeName": "string"
        }
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token salah atau dipakai ulang — errorCode: `ADMISSION_TOKEN_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|
|410|[Gone](https://tools.ietf.org/html/rfc7231#section-6.5.9)|Giliran lewat — errorCode: `TURN_MISSED`, `SESSION_EXPIRED`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

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
|» data|[BookingSession](#schemabookingsession)|true|none||none|
|»» sessionId|string(uuid)|true|none||none|
|»» eventId|string(uuid)|true|none||none|
|»» phase|string|true|none||none|
|»» reason|string|false|none||none|
|»» outstandingUnits|integer|false|none||Unit cadangan yang belum di-hold (0 setelah hold); batas jumlah item pada hold|
|»» reservedUnits|integer|true|none||none|
|»» maxSelectable|integer|true|none||none|
|»» buyerNikMasked|string|false|none||NIK tersamar|
|»» allowMixedCategories|boolean|false|none||none|
|»» expiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» submitGraceSeconds|integer|false|none||none|
|»» selectionWarningSeconds|integer|false|none||none|
|»» editEnabled|boolean|false|none||none|
|»» maxEdits|integer|false|none||none|
|»» categories|[object]|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» code|string|true|none||none|
|»»» name|string|true|none||none|
|»»» priceMinor|integer(int64)|true|none||Minor unit IDR|
|»»» available|integer|true|none||none|
|»» booking|[Booking](#schemabooking)¦null|false|none||none|
|»»» bookingId|string(uuid)|true|none||none|
|»»» publicRef|string|true|none||none|
|»»» orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|»»» ticketQuantity|integer|true|none||none|
|»»» buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|»»» status|string|true|none||none|
|»»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»»» currency|string|false|none||none|
|»»» paymentExpiresAt|string(date-time)|true|none||none|
|»»» serverTime|string(date-time)|true|none||none|
|»»» version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|»»» canEdit|boolean|true|none||none|
|»»» editableUntil|string(date-time)|false|none||none|
|»»» editsRemaining|integer|false|none||none|
|»»» lockReason|string¦null|false|none||none|
|»»» paymentPageUrl|string|false|none||none|
|»»» items|[object]|false|none||none|
|»»»» itemId|string(uuid)|true|none||none|
|»»»» categoryId|string(uuid)|true|none||none|
|»»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»»» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|phase|SELECTING|
|phase|EDITABLE|
|phase|LOCKED|
|phase|ENDED|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

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

HTTP Status Code **403**

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

<a id="opIdgetCurrentSession"></a>

## GET Pulihkan sesi/pesanan (refresh, koneksi putus, back)

GET /api/v1/booking-sessions/current

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
    "sessionId": "f6567dd8-e069-418e-8893-7d22fcf12459",
    "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
    "phase": "SELECTING",
    "reason": "string",
    "outstandingUnits": 0,
    "reservedUnits": 0,
    "maxSelectable": 0,
    "buyerNikMasked": "3174********0001",
    "allowMixedCategories": true,
    "expiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "submitGraceSeconds": 0,
    "selectionWarningSeconds": 0,
    "editEnabled": true,
    "maxEdits": 0,
    "categories": [
      {
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "code": "string",
        "name": "string",
        "priceMinor": 0,
        "available": 0
      }
    ],
    "booking": {
      "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
      "publicRef": "RB-00912",
      "orderId": "RB-00912",
      "ticketQuantity": 1,
      "buyerNikMasked": "3174********0001",
      "status": "PENDING_PAYMENT",
      "amountMinor": 0,
      "currency": "IDR",
      "paymentExpiresAt": "2019-08-24T14:15:22Z",
      "serverTime": "2019-08-24T14:15:22Z",
      "version": 0,
      "canEdit": true,
      "editableUntil": "2019-08-24T14:15:22Z",
      "editsRemaining": 0,
      "lockReason": "PAYMENT_STARTED",
      "paymentPageUrl": "string",
      "items": [
        {
          "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
          "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
          "attendeeNikMasked": "3174********0001",
          "attendeeName": "string"
        }
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada sesi aktif — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
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
|» data|[BookingSession](#schemabookingsession)|true|none||none|
|»» sessionId|string(uuid)|true|none||none|
|»» eventId|string(uuid)|true|none||none|
|»» phase|string|true|none||none|
|»» reason|string|false|none||none|
|»» outstandingUnits|integer|false|none||Unit cadangan yang belum di-hold (0 setelah hold); batas jumlah item pada hold|
|»» reservedUnits|integer|true|none||none|
|»» maxSelectable|integer|true|none||none|
|»» buyerNikMasked|string|false|none||NIK tersamar|
|»» allowMixedCategories|boolean|false|none||none|
|»» expiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» submitGraceSeconds|integer|false|none||none|
|»» selectionWarningSeconds|integer|false|none||none|
|»» editEnabled|boolean|false|none||none|
|»» maxEdits|integer|false|none||none|
|»» categories|[object]|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» code|string|true|none||none|
|»»» name|string|true|none||none|
|»»» priceMinor|integer(int64)|true|none||Minor unit IDR|
|»»» available|integer|true|none||none|
|»» booking|[Booking](#schemabooking)¦null|false|none||none|
|»»» bookingId|string(uuid)|true|none||none|
|»»» publicRef|string|true|none||none|
|»»» orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|»»» ticketQuantity|integer|true|none||none|
|»»» buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|»»» status|string|true|none||none|
|»»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»»» currency|string|false|none||none|
|»»» paymentExpiresAt|string(date-time)|true|none||none|
|»»» serverTime|string(date-time)|true|none||none|
|»»» version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|»»» canEdit|boolean|true|none||none|
|»»» editableUntil|string(date-time)|false|none||none|
|»»» editsRemaining|integer|false|none||none|
|»»» lockReason|string¦null|false|none||none|
|»»» paymentPageUrl|string|false|none||none|
|»»» items|[object]|false|none||none|
|»»»» itemId|string(uuid)|true|none||none|
|»»»» categoryId|string(uuid)|true|none||none|
|»»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»»» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|phase|SELECTING|
|phase|EDITABLE|
|phase|LOCKED|
|phase|ENDED|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

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

<a id="opIdgetSession"></a>

## GET Sisa waktu dan ketersediaan live (fallback SSE)

GET /api/v1/booking-sessions/{sessionId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|sessionId|path|string(uuid)| yes |none|

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
    "sessionId": "f6567dd8-e069-418e-8893-7d22fcf12459",
    "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
    "phase": "SELECTING",
    "reason": "string",
    "outstandingUnits": 0,
    "reservedUnits": 0,
    "maxSelectable": 0,
    "buyerNikMasked": "3174********0001",
    "allowMixedCategories": true,
    "expiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "submitGraceSeconds": 0,
    "selectionWarningSeconds": 0,
    "editEnabled": true,
    "maxEdits": 0,
    "categories": [
      {
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "code": "string",
        "name": "string",
        "priceMinor": 0,
        "available": 0
      }
    ],
    "booking": {
      "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
      "publicRef": "RB-00912",
      "orderId": "RB-00912",
      "ticketQuantity": 1,
      "buyerNikMasked": "3174********0001",
      "status": "PENDING_PAYMENT",
      "amountMinor": 0,
      "currency": "IDR",
      "paymentExpiresAt": "2019-08-24T14:15:22Z",
      "serverTime": "2019-08-24T14:15:22Z",
      "version": 0,
      "canEdit": true,
      "editableUntil": "2019-08-24T14:15:22Z",
      "editsRemaining": 0,
      "lockReason": "PAYMENT_STARTED",
      "paymentPageUrl": "string",
      "items": [
        {
          "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
          "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
          "attendeeNikMasked": "3174********0001",
          "attendeeName": "string"
        }
      ]
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|410|[Gone](https://tools.ietf.org/html/rfc7231#section-6.5.9)|Sesi habis — errorCode: `SESSION_EXPIRED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[BookingSession](#schemabookingsession)|true|none||none|
|»» sessionId|string(uuid)|true|none||none|
|»» eventId|string(uuid)|true|none||none|
|»» phase|string|true|none||none|
|»» reason|string|false|none||none|
|»» outstandingUnits|integer|false|none||Unit cadangan yang belum di-hold (0 setelah hold); batas jumlah item pada hold|
|»» reservedUnits|integer|true|none||none|
|»» maxSelectable|integer|true|none||none|
|»» buyerNikMasked|string|false|none||NIK tersamar|
|»» allowMixedCategories|boolean|false|none||none|
|»» expiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» submitGraceSeconds|integer|false|none||none|
|»» selectionWarningSeconds|integer|false|none||none|
|»» editEnabled|boolean|false|none||none|
|»» maxEdits|integer|false|none||none|
|»» categories|[object]|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» code|string|true|none||none|
|»»» name|string|true|none||none|
|»»» priceMinor|integer(int64)|true|none||Minor unit IDR|
|»»» available|integer|true|none||none|
|»» booking|[Booking](#schemabooking)¦null|false|none||none|
|»»» bookingId|string(uuid)|true|none||none|
|»»» publicRef|string|true|none||none|
|»»» orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|»»» ticketQuantity|integer|true|none||none|
|»»» buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|»»» status|string|true|none||none|
|»»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»»» currency|string|false|none||none|
|»»» paymentExpiresAt|string(date-time)|true|none||none|
|»»» serverTime|string(date-time)|true|none||none|
|»»» version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|»»» canEdit|boolean|true|none||none|
|»»» editableUntil|string(date-time)|false|none||none|
|»»» editsRemaining|integer|false|none||none|
|»»» lockReason|string¦null|false|none||none|
|»»» paymentPageUrl|string|false|none||none|
|»»» items|[object]|false|none||none|
|»»»» itemId|string(uuid)|true|none||none|
|»»»» categoryId|string(uuid)|true|none||none|
|»»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»»» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|phase|SELECTING|
|phase|EDITABLE|
|phase|LOCKED|
|phase|ENDED|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

HTTP Status Code **400**

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

HTTP Status Code **403**

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

<a id="opIdstreamSession"></a>

## GET SSE ketersediaan kategori dan sisa waktu

GET /api/v1/booking-sessions/{sessionId}/stream

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|sessionId|path|string(uuid)| yes |none|

> Response Examples

> 200 Response

> 400 Response

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
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|text/event-stream: event `availability` dan `timer`; heartbeat SSE_HEARTBEAT_SECONDS|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Batas koneksi SSE instance tercapai; klien beralih ke polling — errorCode: `DEPENDENCY_UNAVAILABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

<a id="opIdcheckAttendee"></a>

## POST Cek NIK pemegang saat diketik

POST /api/v1/booking-sessions/{sessionId}/attendee-checks

> Body Parameters

```json
{
  "nik": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|sessionId|path|string(uuid)| yes |none|
|body|body|[AttendeeCheckRequest](#schemaattendeecheckrequest)| yes |none|

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
    "result": "AVAILABLE",
    "checksRemaining": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Struktur NIK salah (jatah cek tidak berkurang) — errorCode: `NIK_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|
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
|» data|[AttendeeCheck](#schemaattendeecheck)|true|none||none|
|»» result|string|true|none||none|
|»» checksRemaining|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|result|AVAILABLE|
|result|ALREADY_REGISTERED|
|result|CHECK_LIMIT_REACHED|

HTTP Status Code **400**

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

HTTP Status Code **403**

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

HTTP Status Code **422**

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

<a id="opIdcancelSession"></a>

## POST Keluar tanpa membeli

POST /api/v1/booking-sessions/{sessionId}/cancel

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|sessionId|path|string(uuid)| yes |none|

> Response Examples

> 400 Response

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
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Alokasi dilepas ke pengantre berikutnya|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

<a id="opIdcreateBooking"></a>

## POST Hold: NIK dan nama pemegang per tiket

POST /api/v1/bookings

> Body Parameters

```json
{
  "sessionId": "f6567dd8-e069-418e-8893-7d22fcf12459",
  "buyer": {
    "nik": "string",
    "email": "user@example.com",
    "emailConfirmation": "user@example.com",
    "consent": true
  },
  "items": [
    {
      "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
      "attendee": {
        "nik": "string",
        "fullName": "string"
      }
    }
  ]
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Idempotency-Key|header|string| yes |Unik per tombol; retry memakai key yang sama (SRS §3.2.24)|
|body|body|[HoldRequest](#schemaholdrequest)| yes |none|

> Response Examples

> 201 Response

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
    "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
    "publicRef": "RB-00912",
    "orderId": "RB-00912",
    "ticketQuantity": 1,
    "buyerNikMasked": "3174********0001",
    "status": "PENDING_PAYMENT",
    "amountMinor": 0,
    "currency": "IDR",
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "version": 0,
    "canEdit": true,
    "editableUntil": "2019-08-24T14:15:22Z",
    "editsRemaining": 0,
    "lockReason": "PAYMENT_STARTED",
    "paymentPageUrl": "string",
    "items": [
      {
        "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "attendeeNikMasked": "3174********0001",
        "attendeeName": "string"
      }
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Field tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Konflik — errorCode: `ATTENDEE_NIK_ALREADY_REGISTERED`, `ATTENDEE_NIK_DUPLICATE_IN_ORDER`, `CATEGORY_UNAVAILABLE` (pesan `CATEGORY_UNAVAILABLE: <categoryId>[,<categoryId>]`, id terurut, dipisah koma; baca ulang ketersediaan kategori lewat endpoint/SSE yang ada), `IDEMPOTENCY_KEY_REUSED`, `EVENT_CANCELLED`|[ErrorEnvelope](#schemaerrorenvelope)|
|410|[Gone](https://tools.ietf.org/html/rfc7231#section-6.5.9)|Sesi habis — errorCode: `SESSION_EXPIRED`|[ErrorEnvelope](#schemaerrorenvelope)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Melebihi batas atau aturan event — errorCode: `QUANTITY_EXCEEDS_LIMIT`, `QUANTITY_INVALID` (kosong atau lebih dari unit yang dicadangkan untuk sesi ini), `MIXED_CATEGORIES_NOT_ALLOWED`, `NIK_INVALID`, `NIK_NOT_LINKED` (NIK belum tertaut; pengguna dapat beralih ke input manual), `EMAIL_MISMATCH`, `CONSENT_REQUIRED`, `BUYER_NIK_LIMIT_REACHED` ("NIK ini sudah mencapai batas, gunakan NIK lain"; sesi, unit cadangan, dan timer tetap; boleh dicoba lagi dengan NIK pembeli lain dan Idempotency-Key yang sama)|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Terlalu banyak percobaan NIK pembeli pada sesi ini; tunggu sesuai header Retry-After — errorCode: `BUYER_NIK_THROTTLED`|[ErrorEnvelope](#schemaerrorenvelope)|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Dependency sementara tidak tersedia; ulangi dengan Idempotency-Key yang sama — errorCode: `DEPENDENCY_UNAVAILABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

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
|» data|[Booking](#schemabooking)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» publicRef|string|true|none||none|
|»» orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|»» ticketQuantity|integer|true|none||none|
|»» buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|»» status|string|true|none||none|
|»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»» currency|string|false|none||none|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|»» canEdit|boolean|true|none||none|
|»» editableUntil|string(date-time)|false|none||none|
|»» editsRemaining|integer|false|none||none|
|»» lockReason|string¦null|false|none||none|
|»» paymentPageUrl|string|false|none||none|
|»» items|[object]|false|none||none|
|»»» itemId|string(uuid)|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

HTTP Status Code **400**

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

HTTP Status Code **422**

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

<a id="opIdreplaceItems"></a>

## PUT Ubah pesanan sebelum Bayar (penggantian atomik)

PUT /api/v1/bookings/{bookingId}/items

> Body Parameters

```json
{
  "version": 0,
  "items": [
    {
      "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
      "attendee": {
        "nik": "string",
        "fullName": "string"
      }
    }
  ]
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|
|Idempotency-Key|header|string| yes |Unik per tombol; retry memakai key yang sama (SRS §3.2.24)|
|body|body|[ReplaceItemsRequest](#schemareplaceitemsrequest)| yes |none|

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
    "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
    "publicRef": "RB-00912",
    "orderId": "RB-00912",
    "ticketQuantity": 1,
    "buyerNikMasked": "3174********0001",
    "status": "PENDING_PAYMENT",
    "amountMinor": 0,
    "currency": "IDR",
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "version": 0,
    "canEdit": true,
    "editableUntil": "2019-08-24T14:15:22Z",
    "editsRemaining": 0,
    "lockReason": "PAYMENT_STARTED",
    "paymentPageUrl": "string",
    "items": [
      {
        "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "attendeeNikMasked": "3174********0001",
        "attendeeName": "string"
      }
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Pesanan baru; paymentExpiresAt tidak berubah|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Konflik; pesanan lama tetap utuh — errorCode: `BOOKING_LOCKED`, `BOOKING_VERSION_CONFLICT`, `EDIT_LIMIT_REACHED`, `CATEGORY_UNAVAILABLE`, `ATTENDEE_NIK_ALREADY_REGISTERED`|[ErrorEnvelope](#schemaerrorenvelope)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Melebihi batas — errorCode: `QUANTITY_EXCEEDS_LIMIT`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[Booking](#schemabooking)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» publicRef|string|true|none||none|
|»» orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|»» ticketQuantity|integer|true|none||none|
|»» buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|»» status|string|true|none||none|
|»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»» currency|string|false|none||none|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|»» canEdit|boolean|true|none||none|
|»» editableUntil|string(date-time)|false|none||none|
|»» editsRemaining|integer|false|none||none|
|»» lockReason|string¦null|false|none||none|
|»» paymentPageUrl|string|false|none||none|
|»» items|[object]|false|none||none|
|»»» itemId|string(uuid)|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

HTTP Status Code **400**

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

HTTP Status Code **403**

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

HTTP Status Code **422**

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

<a id="opIdgetBooking"></a>

## GET Status booking

GET /api/v1/bookings/{bookingId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|

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
    "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
    "publicRef": "RB-00912",
    "orderId": "RB-00912",
    "ticketQuantity": 1,
    "buyerNikMasked": "3174********0001",
    "status": "PENDING_PAYMENT",
    "amountMinor": 0,
    "currency": "IDR",
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "version": 0,
    "canEdit": true,
    "editableUntil": "2019-08-24T14:15:22Z",
    "editsRemaining": 0,
    "lockReason": "PAYMENT_STARTED",
    "paymentPageUrl": "string",
    "items": [
      {
        "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "attendeeNikMasked": "3174********0001",
        "attendeeName": "string"
      }
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[Booking](#schemabooking)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» publicRef|string|true|none||none|
|»» orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|»» ticketQuantity|integer|true|none||none|
|»» buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|»» status|string|true|none||none|
|»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»» currency|string|false|none||none|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|»» canEdit|boolean|true|none||none|
|»» editableUntil|string(date-time)|false|none||none|
|»» editsRemaining|integer|false|none||none|
|»» lockReason|string¦null|false|none||none|
|»» paymentPageUrl|string|false|none||none|
|»» items|[object]|false|none||none|
|»»» itemId|string(uuid)|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

HTTP Status Code **400**

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

HTTP Status Code **403**

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

<a id="opIdcancelBooking"></a>

## POST Batal sebelum bayar (SHOULD)

POST /api/v1/bookings/{bookingId}/cancel

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|

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
    "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
    "publicRef": "RB-00912",
    "orderId": "RB-00912",
    "ticketQuantity": 1,
    "buyerNikMasked": "3174********0001",
    "status": "PENDING_PAYMENT",
    "amountMinor": 0,
    "currency": "IDR",
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "version": 0,
    "canEdit": true,
    "editableUntil": "2019-08-24T14:15:22Z",
    "editsRemaining": 0,
    "lockReason": "PAYMENT_STARTED",
    "paymentPageUrl": "string",
    "items": [
      {
        "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "attendeeNikMasked": "3174********0001",
        "attendeeName": "string"
      }
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Tidak bisa dibatalkan — errorCode: `BOOKING_LOCKED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[Booking](#schemabooking)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» publicRef|string|true|none||none|
|»» orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|»» ticketQuantity|integer|true|none||none|
|»» buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|»» status|string|true|none||none|
|»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»» currency|string|false|none||none|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|»» canEdit|boolean|true|none||none|
|»» editableUntil|string(date-time)|false|none||none|
|»» editsRemaining|integer|false|none||none|
|»» lockReason|string¦null|false|none||none|
|»» paymentPageUrl|string|false|none||none|
|»» items|[object]|false|none||none|
|»»» itemId|string(uuid)|true|none||none|
|»»» categoryId|string(uuid)|true|none||none|
|»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

HTTP Status Code **400**

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

HTTP Status Code **403**

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

<a id="opIdgetTickets"></a>

## GET E-tiket (setelah PAID)

GET /api/v1/bookings/{bookingId}/tickets

Hanya untuk pemilik booking: visitor token yang sama, akun pembeli yang sama (bearer), atau tautan e-tiket dari email (?t=). Selain itu 404 (tidak dibedakan dari booking yang tidak ada). 409 bila belum PAID.

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|

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
    "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
    "orderId": "string",
    "publicRef": "string",
    "amountMinor": 0,
    "ticketQuantity": 1,
    "buyerNikMasked": "3174********0001",
    "tickets": [
      {
        "ticketCode": "string",
        "categoryCode": "string",
        "attendeeName": "string",
        "attendeeNikMasked": "3174********0001",
        "qrPayload": "string"
      }
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parameter path bukan UUID atau body tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token valid tetapi bukan pemilik sesi/pesanan — errorCode: `VISITOR_MISMATCH`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Belum PAID — errorCode: `BOOKING_NOT_PAYABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[TicketList](#schematicketlist)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» orderId|string|true|none||none|
|»» publicRef|string|true|none||none|
|»» amountMinor|integer(int64)|true|none||none|
|»» ticketQuantity|integer|true|none||none|
|»» buyerNikMasked|string|true|none||none|
|»» tickets|[[Ticket](#schematicket)]|true|none||none|
|»»» ticketCode|string|true|none||none|
|»»» categoryCode|string|true|none||none|
|»»» attendeeName|string|true|none||none|
|»»» attendeeNikMasked|string|true|none||NIK tersamar|
|»»» qrPayload|string|true|none||String untuk dirender sebagai QR (RBT:<ticketCode>). Tidak memuat data pribadi.|

HTTP Status Code **400**

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

HTTP Status Code **403**

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

<a id="opIdlistMyBookings"></a>

## GET Riwayat pesanan pembeli yang login (ADR-020)

GET /api/v1/me/bookings

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|cursor|query|string| no |none|
|limit|query|integer| no |none|

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
    "bookings": [
      {
        "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
        "publicRef": "string",
        "eventName": "string",
        "status": "PENDING_PAYMENT",
        "amountMinor": 0,
        "createdAt": "2019-08-24T14:15:22Z"
      }
    ],
    "nextCursor": "string"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Access token tidak valid — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[MyBookings](#schemamybookings)|true|none||Riwayat pesanan pembeli yang login (ADR-020)|
|»» bookings|[object]|true|none||none|
|»»» bookingId|string(uuid)|false|none||none|
|»»» publicRef|string|false|none||none|
|»»» eventName|string|false|none||none|
|»»» status|string|false|none||none|
|»»» amountMinor|integer(int64)|false|none||Minor unit IDR|
|»»» createdAt|string(date-time)|false|none||none|
|»» nextCursor|string¦null|false|none||none|

#### Enum

|Name|Value|
|---|---|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|

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

<h2 id="tocS_EventSummary">EventSummary</h2>

<a id="schemaeventsummary"></a>
<a id="schema_EventSummary"></a>
<a id="tocSeventsummary"></a>
<a id="tocseventsummary"></a>

```json
{
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "slug": "string",
  "name": "string",
  "venue": "string",
  "startsAt": "2019-08-24T14:15:22Z",
  "salesStartsAt": "2019-08-24T14:15:22Z",
  "salesEndsAt": "2019-08-24T14:15:22Z",
  "status": "NOT_STARTED",
  "minPriceMinor": 0,
  "imageUrl": "string",
  "bannerUrl": "string",
  "thumbnailUrl": "string",
  "genres": [
    "string"
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|eventId|string(uuid)|true|none||none|
|slug|string|true|none||none|
|name|string|true|none||none|
|venue|string|false|none||none|
|startsAt|string(date-time)|false|none||none|
|salesStartsAt|string(date-time)|true|none||none|
|salesEndsAt|string(date-time)|true|none||none|
|status|string|true|none||none|
|minPriceMinor|integer(int64)|false|none||Minor unit IDR|
|imageUrl|string|false|none||URL gambar utama; tidak ada bila belum diunggah (API admin images)|
|bannerUrl|string|false|none||URL banner (hero detail event); tidak ada bila belum diunggah|
|thumbnailUrl|string|false|none||URL thumbnail kartu katalog; tidak ada bila belum diunggah|
|genres|[string]|true|none||Genre event (SRS-F-28-04, US-015). Selalu array; `[]` bila kosong. Dinormalisasi uppercase. Dipakai filter query `genres` (overlap).|

#### Enum

|Name|Value|
|---|---|
|status|NOT_STARTED|
|status|AVAILABLE|
|status|SOLD_OUT|
|status|CLOSED|
|status|CANCELLED|

<h2 id="tocS_EventList">EventList</h2>

<a id="schemaeventlist"></a>
<a id="schema_EventList"></a>
<a id="tocSeventlist"></a>
<a id="tocseventlist"></a>

```json
{
  "events": [
    {
      "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
      "slug": "string",
      "name": "string",
      "venue": "string",
      "startsAt": "2019-08-24T14:15:22Z",
      "salesStartsAt": "2019-08-24T14:15:22Z",
      "salesEndsAt": "2019-08-24T14:15:22Z",
      "status": "NOT_STARTED",
      "minPriceMinor": 0,
      "imageUrl": "string",
      "bannerUrl": "string",
      "thumbnailUrl": "string",
      "genres": [
        "string"
      ]
    }
  ],
  "serverTime": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|events|[[EventSummary](#schemaeventsummary)]|true|none||none|
|serverTime|string(date-time)|true|none||none|

<h2 id="tocS_EventFacets">EventFacets</h2>

<a id="schemaeventfacets"></a>
<a id="schema_EventFacets"></a>
<a id="tocSeventfacets"></a>
<a id="tocseventfacets"></a>

```json
{
  "cities": [
    "string"
  ],
  "genres": [
    "string"
  ]
}

```

Nilai filter yang tersedia lintas katalog publik (event terbit, non-cancelled).

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|cities|[string]|true|none||Daftar kota distinct (non-kosong), terurut. Selalu array ([] bila kosong).|
|genres|[string]|true|none||Daftar token genre distinct, terurut. Selalu array ([] bila kosong).|

<h2 id="tocS_EventDetail">EventDetail</h2>

<a id="schemaeventdetail"></a>
<a id="schema_EventDetail"></a>
<a id="tocSeventdetail"></a>
<a id="tocseventdetail"></a>

```json
{
  "event": {
    "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
    "slug": "string",
    "name": "string",
    "venue": "string",
    "startsAt": "2019-08-24T14:15:22Z",
    "salesStartsAt": "2019-08-24T14:15:22Z",
    "salesEndsAt": "2019-08-24T14:15:22Z",
    "status": "NOT_STARTED",
    "minPriceMinor": 0,
    "imageUrl": "string",
    "bannerUrl": "string",
    "thumbnailUrl": "string",
    "genres": [
      "string"
    ]
  },
  "maxTicketsPerOrder": 0,
  "maxTicketsPerBuyerNik": 0,
  "allowMixedCategories": true,
  "published": true,
  "categories": [
    {
      "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
      "code": "string",
      "name": "string",
      "priceMinor": 0,
      "available": 0
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|event|[EventSummary](#schemaeventsummary)|true|none||none|
|maxTicketsPerOrder|integer|false|none||none|
|maxTicketsPerBuyerNik|integer|false|none||none|
|allowMixedCategories|boolean|false|none||none|
|published|boolean|false|none||Selalu true di katalog publik (event draf menjawab 404). Draf hanya terlihat oleh admin.|
|categories|[object]|true|none||none|
|» categoryId|string(uuid)|true|none||none|
|» code|string|true|none||none|
|» name|string|true|none||none|
|» priceMinor|integer(int64)|true|none||Minor unit IDR|
|» available|integer|true|none||none|

<h2 id="tocS_CreateSessionRequest">CreateSessionRequest</h2>

<a id="schemacreatesessionrequest"></a>
<a id="schema_CreateSessionRequest"></a>
<a id="tocScreatesessionrequest"></a>
<a id="tocscreatesessionrequest"></a>

```json
{
  "admissionToken": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|admissionToken|string|true|none||none|

<h2 id="tocS_BookingSession">BookingSession</h2>

<a id="schemabookingsession"></a>
<a id="schema_BookingSession"></a>
<a id="tocSbookingsession"></a>
<a id="tocsbookingsession"></a>

```json
{
  "sessionId": "f6567dd8-e069-418e-8893-7d22fcf12459",
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "phase": "SELECTING",
  "reason": "string",
  "outstandingUnits": 0,
  "reservedUnits": 0,
  "maxSelectable": 0,
  "buyerNikMasked": "3174********0001",
  "allowMixedCategories": true,
  "expiresAt": "2019-08-24T14:15:22Z",
  "serverTime": "2019-08-24T14:15:22Z",
  "submitGraceSeconds": 0,
  "selectionWarningSeconds": 0,
  "editEnabled": true,
  "maxEdits": 0,
  "categories": [
    {
      "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
      "code": "string",
      "name": "string",
      "priceMinor": 0,
      "available": 0
    }
  ],
  "booking": {
    "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
    "publicRef": "RB-00912",
    "orderId": "RB-00912",
    "ticketQuantity": 1,
    "buyerNikMasked": "3174********0001",
    "status": "PENDING_PAYMENT",
    "amountMinor": 0,
    "currency": "IDR",
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "version": 0,
    "canEdit": true,
    "editableUntil": "2019-08-24T14:15:22Z",
    "editsRemaining": 0,
    "lockReason": "PAYMENT_STARTED",
    "paymentPageUrl": "string",
    "items": [
      {
        "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
        "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
        "attendeeNikMasked": "3174********0001",
        "attendeeName": "string"
      }
    ]
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|sessionId|string(uuid)|true|none||none|
|eventId|string(uuid)|true|none||none|
|phase|string|true|none||none|
|reason|string|false|none||none|
|outstandingUnits|integer|false|none||Unit cadangan yang belum di-hold (0 setelah hold); batas jumlah item pada hold|
|reservedUnits|integer|true|none||none|
|maxSelectable|integer|true|none||none|
|buyerNikMasked|string|false|none||NIK tersamar|
|allowMixedCategories|boolean|false|none||none|
|expiresAt|string(date-time)|true|none||none|
|serverTime|string(date-time)|true|none||none|
|submitGraceSeconds|integer|false|none||none|
|selectionWarningSeconds|integer|false|none||none|
|editEnabled|boolean|false|none||none|
|maxEdits|integer|false|none||none|
|categories|[object]|true|none||none|
|» categoryId|string(uuid)|true|none||none|
|» code|string|true|none||none|
|» name|string|true|none||none|
|» priceMinor|integer(int64)|true|none||Minor unit IDR|
|» available|integer|true|none||none|
|booking|[Booking](#schemabooking)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|phase|SELECTING|
|phase|EDITABLE|
|phase|LOCKED|
|phase|ENDED|

<h2 id="tocS_AttendeeCheckRequest">AttendeeCheckRequest</h2>

<a id="schemaattendeecheckrequest"></a>
<a id="schema_AttendeeCheckRequest"></a>
<a id="tocSattendeecheckrequest"></a>
<a id="tocsattendeecheckrequest"></a>

```json
{
  "nik": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|nik|string|true|none||NIK 16 digit (dicek strukturnya; tidak pernah disimpan plaintext)|

<h2 id="tocS_AttendeeCheck">AttendeeCheck</h2>

<a id="schemaattendeecheck"></a>
<a id="schema_AttendeeCheck"></a>
<a id="tocSattendeecheck"></a>
<a id="tocsattendeecheck"></a>

```json
{
  "result": "AVAILABLE",
  "checksRemaining": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|result|string|true|none||none|
|checksRemaining|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|result|AVAILABLE|
|result|ALREADY_REGISTERED|
|result|CHECK_LIMIT_REACHED|

<h2 id="tocS_HoldRequest">HoldRequest</h2>

<a id="schemaholdrequest"></a>
<a id="schema_HoldRequest"></a>
<a id="tocSholdrequest"></a>
<a id="tocsholdrequest"></a>

```json
{
  "sessionId": "f6567dd8-e069-418e-8893-7d22fcf12459",
  "buyer": {
    "nik": "string",
    "email": "user@example.com",
    "emailConfirmation": "user@example.com",
    "consent": true
  },
  "items": [
    {
      "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
      "attendee": {
        "nik": "string",
        "fullName": "string"
      }
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|sessionId|string(uuid)|true|none||none|
|buyer|object|true|none||Data pembeli pada hold. Mode manual mengirim `nik`; mode saved-NIK mengirim `useLoginNik: true`, bearer pembeli wajib, dan `nik` dihilangkan.|
|» nik|string|conditional|none||NIK pembeli 16 digit; wajib bila `useLoginNik` bukan `true`. Bila memakai NIK akun, kirim `useLoginNik: true` dan hilangkan `nik`.|
|» useLoginNik|boolean|false|none||Gunakan NIK tersimpan dari akun; bearer pembeli wajib dan akun harus memiliki NIK tertaut.|
|» email|string(email)|true|none||none|
|» emailConfirmation|string(email)|true|none||none|
|» consent|boolean|true|none||none|
|items|[object]|true|none||Satu item per tiket; 1 qty = 1 NIK pemegang. Jumlah item tidak boleh melebihi outstandingUnits sesi.|
|» categoryId|string(uuid)|true|none||none|
|» attendee|object|true|none||none|
|»» nik|string|conditional|none||NIK penonton 16 digit; hilangkan bila `useLoginNik: true`.|
|»» useLoginNik|boolean|false|none||Gunakan NIK akun pembeli untuk tiket ini; hanya satu attendee per pesanan dan buyer harus memakai `useLoginNik: true`.|
|»» fullName|string|true|none||none|

<h2 id="tocS_ReplaceItemsRequest">ReplaceItemsRequest</h2>

<a id="schemareplaceitemsrequest"></a>
<a id="schema_ReplaceItemsRequest"></a>
<a id="tocSreplaceitemsrequest"></a>
<a id="tocsreplaceitemsrequest"></a>

```json
{
  "version": 0,
  "items": [
    {
      "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
      "attendee": {
        "nik": "string",
        "fullName": "string"
      }
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|version|integer|true|none||none|
|items|[object]|true|none||none|
|» categoryId|string(uuid)|true|none||none|
|» attendee|any|true|none||none|

oneOf

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|»» *anonymous*|object|false|none||none|
|»»» nik|string|true|none||NIK 16 digit (dicek strukturnya; tidak pernah disimpan plaintext)|
|»»» fullName|string|true|none||none|

xor

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|»» *anonymous*|object|false|none||Pertahankan pemegang item lama tanpa mengirim ulang NIK|
|»»» keepFromItemId|string(uuid)|true|none||none|

<h2 id="tocS_Booking">Booking</h2>

<a id="schemabooking"></a>
<a id="schema_Booking"></a>
<a id="tocSbooking"></a>
<a id="tocsbooking"></a>

```json
{
  "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
  "publicRef": "RB-00912",
  "orderId": "RB-00912",
  "ticketQuantity": 1,
  "buyerNikMasked": "3174********0001",
  "status": "PENDING_PAYMENT",
  "amountMinor": 0,
  "currency": "IDR",
  "paymentExpiresAt": "2019-08-24T14:15:22Z",
  "serverTime": "2019-08-24T14:15:22Z",
  "version": 0,
  "canEdit": true,
  "editableUntil": "2019-08-24T14:15:22Z",
  "editsRemaining": 0,
  "lockReason": "PAYMENT_STARTED",
  "paymentPageUrl": "string",
  "items": [
    {
      "itemId": "f11b669d-7201-4c21-88af-d85092f0c005",
      "categoryId": "337f5e5d-288b-40d5-be14-901cc3acacc0",
      "attendeeNikMasked": "3174********0001",
      "attendeeName": "string"
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bookingId|string(uuid)|true|none||none|
|publicRef|string|true|none||none|
|orderId|string|true|none||Nomor pesanan untuk pelanggan; sama dengan publicRef.|
|ticketQuantity|integer|true|none||none|
|buyerNikMasked|string|true|none||NIK pembeli tersamar; NIK asli tidak pernah dikembalikan.|
|status|string|true|none||none|
|amountMinor|integer(int64)|true|none||Minor unit IDR|
|currency|string|false|none||none|
|paymentExpiresAt|string(date-time)|true|none||none|
|serverTime|string(date-time)|true|none||none|
|version|integer|true|none||Versi stream booking_events terakhir (ADR-019); kirim saat ubah pesanan|
|canEdit|boolean|true|none||none|
|editableUntil|string(date-time)|false|none||none|
|editsRemaining|integer|false|none||none|
|lockReason|string¦null|false|none||none|
|paymentPageUrl|string|false|none||none|
|items|[object]|false|none||none|
|» itemId|string(uuid)|true|none||none|
|» categoryId|string(uuid)|true|none||none|
|» attendeeNikMasked|string|true|none||NIK tersamar|
|» attendeeName|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|
|lockReason|PAYMENT_STARTED|
|lockReason|SELECTION_EXPIRED|
|lockReason|BOOKING_ENDED|
|lockReason|EDIT_DISABLED|
|lockReason|null|

<h2 id="tocS_Ticket">Ticket</h2>

<a id="schematicket"></a>
<a id="schema_Ticket"></a>
<a id="tocSticket"></a>
<a id="tocsticket"></a>

```json
{
  "ticketCode": "string",
  "categoryCode": "string",
  "attendeeName": "string",
  "attendeeNikMasked": "3174********0001",
  "qrPayload": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|ticketCode|string|true|none||none|
|categoryCode|string|true|none||none|
|attendeeName|string|true|none||none|
|attendeeNikMasked|string|true|none||NIK tersamar|
|qrPayload|string|true|none||String untuk dirender sebagai QR (RBT:<ticketCode>). Tidak memuat data pribadi.|

<h2 id="tocS_TicketList">TicketList</h2>

<a id="schematicketlist"></a>
<a id="schema_TicketList"></a>
<a id="tocSticketlist"></a>
<a id="tocsticketlist"></a>

```json
{
  "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
  "orderId": "string",
  "publicRef": "string",
  "amountMinor": 0,
  "ticketQuantity": 1,
  "buyerNikMasked": "3174********0001",
  "tickets": [
    {
      "ticketCode": "string",
      "categoryCode": "string",
      "attendeeName": "string",
      "attendeeNikMasked": "3174********0001",
      "qrPayload": "string"
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bookingId|string(uuid)|true|none||none|
|orderId|string|true|none||none|
|publicRef|string|true|none||none|
|amountMinor|integer(int64)|true|none||none|
|ticketQuantity|integer|true|none||none|
|buyerNikMasked|string|true|none||none|
|tickets|[[Ticket](#schematicket)]|true|none||none|

<h2 id="tocS_MyBookings">MyBookings</h2>

<a id="schemamybookings"></a>
<a id="schema_MyBookings"></a>
<a id="tocSmybookings"></a>
<a id="tocsmybookings"></a>

```json
{
  "bookings": [
    {
      "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
      "publicRef": "string",
      "eventName": "string",
      "status": "PENDING_PAYMENT",
      "amountMinor": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "nextCursor": "string"
}

```

Riwayat pesanan pembeli yang login (ADR-020)

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bookings|[object]|true|none||none|
|» bookingId|string(uuid)|false|none||none|
|» publicRef|string|false|none||none|
|» eventName|string|false|none||none|
|» status|string|false|none||none|
|» amountMinor|integer(int64)|false|none||Minor unit IDR|
|» createdAt|string(date-time)|false|none||none|
|nextCursor|string¦null|false|none||none|

#### Enum

|Name|Value|
|---|---|
|status|PENDING_PAYMENT|
|status|VERIFYING|
|status|PAID|
|status|EXPIRED|
|status|CANCELLED|
|status|REVIEW|

