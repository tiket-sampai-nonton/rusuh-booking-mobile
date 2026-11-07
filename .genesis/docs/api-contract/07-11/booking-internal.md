---
title: Booking Internal API
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

# Booking Internal API

Dipanggil Queue dan Payment. Selalu `Authorization: Bearer <service token>` dan `X-Request-ID`. Tidak diekspos lewat ALB publik.

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer<br/>Service token Queue (scope `service`, kunci Queue). Token visitor/queue/admission dari kunci yang sama ditolak.

- HTTP Authentication, scheme: bearer<br/>Access token pembeli User Service (scope `buyer`) yang emailnya ada di ADMIN_EMAILS. Tanpa konfigurasi, semua permintaan ditolak (401).

# internal

<a id="opIdreserveAllocations"></a>

## POST Reservasi alokasi untuk batch admission (dipanggil promotor Queue)

POST /internal/v1/allocations:batch

> Body Parameters

```json
{
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "entries": [
    {
      "queueEntryId": "611971ec-d3c9-48eb-9fb8-16a07555cf37",
      "seq": 0,
      "visitorId": "e45934e1-5fd4-4651-b7bc-50c977a3b8c5",
      "buyerNikHash": "string",
      "buyerNikMasked": "3174********0001",
      "buyerEmailEnc": "string",
      "units": 1,
      "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9"
    }
  ]
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|X-Request-ID|header|string| no |Diteruskan antar service; dibuat bila kosong|
|body|body|[AllocationBatchRequest](#schemaallocationbatchrequest)| yes |none|

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
    "results": [
      {
        "queueEntryId": "611971ec-d3c9-48eb-9fb8-16a07555cf37",
        "outcome": "GRANTED",
        "allocationId": "9ec871ce-3363-4de2-8f79-062881067628",
        "units": 0,
        "claimDeadline": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[AllocationBatchResponse](#schemaallocationbatchresponse)|true|none||none|
|»» results|[object]|true|none||none|
|»»» queueEntryId|string(uuid)|true|none||none|
|»»» outcome|string|true|none||none|
|»»» allocationId|string(uuid)|false|none||none|
|»»» units|integer|false|none||none|
|»»» claimDeadline|string(date-time)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|outcome|GRANTED|
|outcome|NO_SUPPLY_NOW|
|outcome|SOLD_OUT|
|outcome|ALREADY_ACTIVE|

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

<a id="opIdreleaseAllocation"></a>

## POST Lepas alokasi yatim (kompensasi saga, ADR-018)

POST /internal/v1/allocations/{allocationId}:release

> Body Parameters

```json
{
  "reason": "QUEUE_ENTRY_GONE"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|allocationId|path|string(uuid)| yes |none|
|X-Request-ID|header|string| no |Diteruskan antar service; dibuat bila kosong|
|body|body|[ReleaseRequest](#schemareleaserequest)| yes |none|

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
    "released": true
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[ReleaseResponse](#schemareleaseresponse)|true|none||none|
|»» released|boolean|true|none||none|

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

<a id="opIdgetSupply"></a>

## GET Ringkasan stok event (Status Document)

GET /internal/v1/events/{eventId}/supply

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
    "free": 0,
    "allocated": 0,
    "held": 0,
    "sold": 0,
    "total": 0,
    "maxPerOrder": 0,
    "allocatedUnits": 0,
    "heldUnits": 0,
    "freeUnits": 0,
    "maxTicketsPerOrder": 0,
    "salesStartsAt": "2019-08-24T14:15:22Z",
    "salesEndsAt": "2019-08-24T14:15:22Z",
    "saleState": "NOT_STARTED",
    "soldOut": true,
    "version": 0,
    "categories": [
      {
        "code": "string",
        "name": "string",
        "capacity": 0,
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
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[Supply](#schemasupply)|true|none||none|
|»» free|integer|true|none||none|
|»» allocated|integer|true|none||none|
|»» held|integer|true|none||none|
|»» sold|integer|true|none||none|
|»» total|integer|true|none||none|
|»» maxPerOrder|integer|false|none||none|
|»» allocatedUnits|integer|false|none||Unit yang dicadangkan untuk admission yang belum hold (ADR-030, aditif)|
|»» heldUnits|integer|false|none||none|
|»» freeUnits|integer|false|none||none|
|»» maxTicketsPerOrder|integer|false|none||Batas unit per admission (aditif; sumber untuk ukuran admission dan zona status Queue)|
|»» salesStartsAt|string(date-time)|false|none||Awal penjualan (aditif; dasar jendela acak pembukaan)|
|»» salesEndsAt|string(date-time)|false|none||none|
|»» saleState|string|true|none||none|
|»» soldOut|boolean|true|none||none|
|»» version|integer|true|none||none|
|»» categories|[object]|false|none||none|
|»»» code|string|false|none||none|
|»»» name|string|false|none||none|
|»»» capacity|integer|false|none||none|
|»»» available|integer|false|none||none|

#### Enum

|Name|Value|
|---|---|
|saleState|NOT_STARTED|
|saleState|OPEN|
|saleState|CLOSED|

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

<a id="opIdgetPayable"></a>

## GET Data tagihan untuk Payment

GET /internal/v1/bookings/{bookingId}/payable

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
    "publicRef": "string",
    "status": "string",
    "amountMinor": 0,
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "visitorId": "e45934e1-5fd4-4651-b7bc-50c977a3b8c5",
    "version": 0,
    "canEdit": true
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[Payable](#schemapayable)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» publicRef|string|true|none||Human-readable booking reference (e.g., RB-7F3A9C21) for Midtrans order_id|
|»» status|string|true|none||none|
|»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» visitorId|string(uuid)|false|none||none|
|»» version|integer|true|none||none|
|»» canEdit|boolean|false|none||none|

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

<a id="opIdpaymentLock"></a>

## POST Kunci pesanan sebelum attempt (idempoten per attemptKey)

POST /internal/v1/bookings/{bookingId}/payment-lock

> Body Parameters

```json
{
  "attemptKey": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|
|body|body|[PaymentLockRequest](#schemapaymentlockrequest)| yes |none|

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
    "outcome": "OK",
    "version": 0,
    "amountMinor": 0,
    "paymentExpiresAt": "2019-08-24T14:15:22Z"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[PaymentLockResponse](#schemapaymentlockresponse)|true|none||none|
|»» outcome|string|true|none||none|
|»» version|integer|false|none||none|
|»» amountMinor|integer(int64)|false|none||Minor unit IDR|
|»» paymentExpiresAt|string(date-time)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|outcome|OK|
|outcome|BOOKING_NOT_PAYABLE|
|outcome|PAYMENT_EXPIRED|

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

<a id="opIdextendDeadline"></a>

## POST Perpanjangan sekali saat gateway gangguan

POST /internal/v1/bookings/{bookingId}/deadline-extension

> Body Parameters

```json
{
  "reason": "PROVIDER_UNAVAILABLE",
  "seconds": 1
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|
|body|body|[DeadlineExtensionRequest](#schemadeadlineextensionrequest)| yes |none|

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
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "extended": true
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[DeadlineExtensionResponse](#schemadeadlineextensionresponse)|true|none||none|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» extended|boolean|true|none||none|

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
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Ada dependency DOWN|[Health](#schemahealth)|

# admin

<a id="opIdadminCreateEvent"></a>

## POST Create event (seed/testing only)

POST /internal/v1/admin/events

> Body Parameters

```json
{
  "name": "string",
  "slug": "string",
  "venue": "string",
  "startsAt": "2019-08-24T14:15:22Z",
  "salesStartsAt": "2019-08-24T14:15:22Z",
  "salesEndsAt": "2019-08-24T14:15:22Z",
  "maxTicketsPerOrder": 3,
  "maxTicketsPerBuyerNik": 3,
  "allowMixedCategories": true,
  "categories": [
    {
      "code": "string",
      "name": "string",
      "priceMinor": 0,
      "capacity": 0
    }
  ]
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AdminEventCreateRequest](#schemaadmineventcreaterequest)| yes |none|

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
    "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Created|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada, tidak valid, atau scope salah (service token untuk /internal, token pembeli admin untuk /admin) — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

HTTP Status Code **201**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|false|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|object|false|none||none|
|»» eventId|string(uuid)|false|none||none|

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

<a id="opIdadminUpdateEvent"></a>

## PATCH Update event config (only before the sale starts; out-of-range values are 400)

PATCH /internal/v1/admin/events/{eventId}

> Body Parameters

```json
{
  "selectionTtlSeconds": 60,
  "paymentTtlSeconds": 120,
  "editEnabled": true,
  "maxEdits": 0
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|
|body|body|[AdminEventConfigUpdate](#schemaadmineventconfigupdate)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Updated|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Value outside the allowed range (e.g. paymentTtlSeconds < 120) or invalid|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing or invalid user bearer token|None|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Rules locked after sale started|None|

<a id="opIdadminGetEvent"></a>

## GET Detail event untuk admin, termasuk draf. Bentuk respons sama dengan GET /api/v1/events/{eventId} (booking.yaml); field `published` menunjukkan terbit atau draf.

GET /internal/v1/admin/events/{eventId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|eventId bukan UUID|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing or invalid user bearer token|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Event tidak ada|None|

<a id="opIdadminUploadEventImage"></a>

## POST Unggah gambar event (API admin; belum dipakai FE). URL hasil unggah disimpan di image_url / banner_url / thumbnail_url event

POST /internal/v1/admin/events/{eventId}/images

> Body Parameters

```yaml
file: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|
|kind|query|string| no |none|
|body|body|object| yes |none|
|» file|body|string(binary)| yes |JPEG, PNG, atau WebP (dicek dari isi file), 1 byte sampai 5 MB|

#### Enum

|Name|Value|
|---|---|
|kind|image|
|kind|banner|
|kind|thumbnail|

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
    "url": "string"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Tersimpan|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|kind salah, field file kosong/terlalu besar, atau bukan JPEG/PNG/WebP — errorCode `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token tidak ada atau bukan admin|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Event tidak ada — errorCode `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|object|true|none||none|
|»» url|string|true|none||none|

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

<a id="opIdadminPublishEvent"></a>

## POST Terbitkan event (tampil di katalog dan boleh dijual). Idempotent; boleh kapan saja.

POST /internal/v1/admin/events/{eventId}/publish

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Terbit (atau sudah terbit)|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|eventId bukan UUID|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing or invalid user bearer token|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Event tidak ada|None|

<a id="opIdadminUnpublishEvent"></a>

## POST Kembalikan event menjadi draf. Hanya sebelum jendela penjualan dibuka.

POST /internal/v1/admin/events/{eventId}/unpublish

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Draf|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|eventId bukan UUID|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing or invalid user bearer token|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Event tidak ada|None|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Penjualan sudah dibuka — errorCode: `EVENT_RULES_LOCKED`|None|

<a id="opIdadminCancelEvent"></a>

## POST Batalkan event (status CANCELLED, tersimpan). Hilang dari daftar katalog bawaan, detail tetap terbuka dengan status CANCELLED, dan tidak ada admission, hold, atau sesi baru. Idempotent. Booking yang masih menahan stok habis sesuai batas bayarnya; refund b

POST /internal/v1/admin/events/{eventId}/cancel

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Dibatalkan (atau sudah dibatalkan)|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|eventId bukan UUID|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Missing or invalid user bearer token|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Event tidak ada|None|

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

<h2 id="tocS_AllocationBatchRequest">AllocationBatchRequest</h2>

<a id="schemaallocationbatchrequest"></a>
<a id="schema_AllocationBatchRequest"></a>
<a id="tocSallocationbatchrequest"></a>
<a id="tocsallocationbatchrequest"></a>

```json
{
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "entries": [
    {
      "queueEntryId": "611971ec-d3c9-48eb-9fb8-16a07555cf37",
      "seq": 0,
      "visitorId": "e45934e1-5fd4-4651-b7bc-50c977a3b8c5",
      "buyerNikHash": "string",
      "buyerNikMasked": "3174********0001",
      "buyerEmailEnc": "string",
      "units": 1,
      "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9"
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|eventId|string(uuid)|true|none||none|
|entries|[object]|true|none||none|
|» queueEntryId|string(uuid)|true|none||none|
|» seq|integer|true|none||none|
|» visitorId|string(uuid)|true|none||none|
|» buyerNikHash|string|false|none||OPSIONAL dan tidak lagi dikirim Queue (ADR-030). Bila ada, Booking menjalankan gerbang kuota pembeli<br />saat reservasi seperti dulu; bila tidak ada, gerbang itu dilewati dan kuota dicek saat hold.|
|» buyerNikMasked|string|false|none||OPSIONAL (lihat buyerNikHash). NIK pembeli diikat saat hold, bukan saat reservasi.|
|» buyerEmailEnc|string|false|none||OPSIONAL. Email pembeli disegel dan diikat Booking saat hold (AES-256-GCM, AAD booking.buyer_email); hanya Notification yang membuka.|
|» units|integer|false|none||Jaminan kuantitas (keputusan 3). Queue meminta 3; Booking memotong ke max_tickets_per_order dan ke stok bebas (grant parsial).|
|» accountId|string(uuid)¦null|false|none||Akun pembeli bila login (ADR-020)|

<h2 id="tocS_AllocationBatchResponse">AllocationBatchResponse</h2>

<a id="schemaallocationbatchresponse"></a>
<a id="schema_AllocationBatchResponse"></a>
<a id="tocSallocationbatchresponse"></a>
<a id="tocsallocationbatchresponse"></a>

```json
{
  "results": [
    {
      "queueEntryId": "611971ec-d3c9-48eb-9fb8-16a07555cf37",
      "outcome": "GRANTED",
      "allocationId": "9ec871ce-3363-4de2-8f79-062881067628",
      "units": 0,
      "claimDeadline": "2019-08-24T14:15:22Z"
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|results|[object]|true|none||none|
|» queueEntryId|string(uuid)|true|none||none|
|» outcome|string|true|none||none|
|» allocationId|string(uuid)|false|none||none|
|» units|integer|false|none||none|
|» claimDeadline|string(date-time)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|outcome|GRANTED|
|outcome|NO_SUPPLY_NOW|
|outcome|SOLD_OUT|
|outcome|ALREADY_ACTIVE|

<h2 id="tocS_ReleaseRequest">ReleaseRequest</h2>

<a id="schemareleaserequest"></a>
<a id="schema_ReleaseRequest"></a>
<a id="tocSreleaserequest"></a>
<a id="tocsreleaserequest"></a>

```json
{
  "reason": "QUEUE_ENTRY_GONE"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|reason|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|reason|QUEUE_ENTRY_GONE|

<h2 id="tocS_ReleaseResponse">ReleaseResponse</h2>

<a id="schemareleaseresponse"></a>
<a id="schema_ReleaseResponse"></a>
<a id="tocSreleaseresponse"></a>
<a id="tocsreleaseresponse"></a>

```json
{
  "released": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|released|boolean|true|none||none|

<h2 id="tocS_Supply">Supply</h2>

<a id="schemasupply"></a>
<a id="schema_Supply"></a>
<a id="tocSsupply"></a>
<a id="tocssupply"></a>

```json
{
  "free": 0,
  "allocated": 0,
  "held": 0,
  "sold": 0,
  "total": 0,
  "maxPerOrder": 0,
  "allocatedUnits": 0,
  "heldUnits": 0,
  "freeUnits": 0,
  "maxTicketsPerOrder": 0,
  "salesStartsAt": "2019-08-24T14:15:22Z",
  "salesEndsAt": "2019-08-24T14:15:22Z",
  "saleState": "NOT_STARTED",
  "soldOut": true,
  "version": 0,
  "categories": [
    {
      "code": "string",
      "name": "string",
      "capacity": 0,
      "available": 0
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|free|integer|true|none||none|
|allocated|integer|true|none||none|
|held|integer|true|none||none|
|sold|integer|true|none||none|
|total|integer|true|none||none|
|maxPerOrder|integer|false|none||none|
|allocatedUnits|integer|false|none||Unit yang dicadangkan untuk admission yang belum hold (ADR-030, aditif)|
|heldUnits|integer|false|none||none|
|freeUnits|integer|false|none||none|
|maxTicketsPerOrder|integer|false|none||Batas unit per admission (aditif; sumber untuk ukuran admission dan zona status Queue)|
|salesStartsAt|string(date-time)|false|none||Awal penjualan (aditif; dasar jendela acak pembukaan)|
|salesEndsAt|string(date-time)|false|none||none|
|saleState|string|true|none||none|
|soldOut|boolean|true|none||none|
|version|integer|true|none||none|
|categories|[object]|false|none||none|
|» code|string|false|none||none|
|» name|string|false|none||none|
|» capacity|integer|false|none||none|
|» available|integer|false|none||none|

#### Enum

|Name|Value|
|---|---|
|saleState|NOT_STARTED|
|saleState|OPEN|
|saleState|CLOSED|

<h2 id="tocS_Payable">Payable</h2>

<a id="schemapayable"></a>
<a id="schema_Payable"></a>
<a id="tocSpayable"></a>
<a id="tocspayable"></a>

```json
{
  "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
  "publicRef": "string",
  "status": "string",
  "amountMinor": 0,
  "paymentExpiresAt": "2019-08-24T14:15:22Z",
  "visitorId": "e45934e1-5fd4-4651-b7bc-50c977a3b8c5",
  "version": 0,
  "canEdit": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bookingId|string(uuid)|true|none||none|
|publicRef|string|true|none||Human-readable booking reference (e.g., RB-7F3A9C21) for Midtrans order_id|
|status|string|true|none||none|
|amountMinor|integer(int64)|true|none||Minor unit IDR|
|paymentExpiresAt|string(date-time)|true|none||none|
|visitorId|string(uuid)|false|none||none|
|version|integer|true|none||none|
|canEdit|boolean|false|none||none|

<h2 id="tocS_PaymentLockRequest">PaymentLockRequest</h2>

<a id="schemapaymentlockrequest"></a>
<a id="schema_PaymentLockRequest"></a>
<a id="tocSpaymentlockrequest"></a>
<a id="tocspaymentlockrequest"></a>

```json
{
  "attemptKey": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|attemptKey|string|true|none||none|

<h2 id="tocS_PaymentLockResponse">PaymentLockResponse</h2>

<a id="schemapaymentlockresponse"></a>
<a id="schema_PaymentLockResponse"></a>
<a id="tocSpaymentlockresponse"></a>
<a id="tocspaymentlockresponse"></a>

```json
{
  "outcome": "OK",
  "version": 0,
  "amountMinor": 0,
  "paymentExpiresAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|outcome|string|true|none||none|
|version|integer|false|none||none|
|amountMinor|integer(int64)|false|none||Minor unit IDR|
|paymentExpiresAt|string(date-time)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|outcome|OK|
|outcome|BOOKING_NOT_PAYABLE|
|outcome|PAYMENT_EXPIRED|

<h2 id="tocS_DeadlineExtensionRequest">DeadlineExtensionRequest</h2>

<a id="schemadeadlineextensionrequest"></a>
<a id="schema_DeadlineExtensionRequest"></a>
<a id="tocSdeadlineextensionrequest"></a>
<a id="tocsdeadlineextensionrequest"></a>

```json
{
  "reason": "PROVIDER_UNAVAILABLE",
  "seconds": 1
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|reason|string|true|none||none|
|seconds|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|reason|PROVIDER_UNAVAILABLE|

<h2 id="tocS_DeadlineExtensionResponse">DeadlineExtensionResponse</h2>

<a id="schemadeadlineextensionresponse"></a>
<a id="schema_DeadlineExtensionResponse"></a>
<a id="tocSdeadlineextensionresponse"></a>
<a id="tocsdeadlineextensionresponse"></a>

```json
{
  "paymentExpiresAt": "2019-08-24T14:15:22Z",
  "extended": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|paymentExpiresAt|string(date-time)|true|none||none|
|extended|boolean|true|none||none|

<h2 id="tocS_AdminEventCreateRequest">AdminEventCreateRequest</h2>

<a id="schemaadmineventcreaterequest"></a>
<a id="schema_AdminEventCreateRequest"></a>
<a id="tocSadmineventcreaterequest"></a>
<a id="tocsadmineventcreaterequest"></a>

```json
{
  "name": "string",
  "slug": "string",
  "venue": "string",
  "startsAt": "2019-08-24T14:15:22Z",
  "salesStartsAt": "2019-08-24T14:15:22Z",
  "salesEndsAt": "2019-08-24T14:15:22Z",
  "maxTicketsPerOrder": 3,
  "maxTicketsPerBuyerNik": 3,
  "allowMixedCategories": true,
  "categories": [
    {
      "code": "string",
      "name": "string",
      "priceMinor": 0,
      "capacity": 0
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|name|string|true|none||none|
|slug|string|true|none||Unique URL slug|
|venue|string|true|none||none|
|startsAt|string(date-time)|true|none||none|
|salesStartsAt|string(date-time)|true|none||none|
|salesEndsAt|string(date-time)|true|none||none|
|maxTicketsPerOrder|integer|false|none||none|
|maxTicketsPerBuyerNik|integer|false|none||none|
|allowMixedCategories|boolean|false|none||none|
|categories|[object]|true|none||none|
|» code|string|true|none||none|
|» name|string|true|none||none|
|» priceMinor|integer(int64)|true|none||Minor unit (IDR)|
|» capacity|integer|true|none||none|

<h2 id="tocS_AdminEventConfigUpdate">AdminEventConfigUpdate</h2>

<a id="schemaadmineventconfigupdate"></a>
<a id="schema_AdminEventConfigUpdate"></a>
<a id="tocSadmineventconfigupdate"></a>
<a id="tocsadmineventconfigupdate"></a>

```json
{
  "selectionTtlSeconds": 60,
  "paymentTtlSeconds": 120,
  "editEnabled": true,
  "maxEdits": 0
}

```

Only the fields present are changed.

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|selectionTtlSeconds|integer|false|none||none|
|paymentTtlSeconds|integer|false|none||Must be >= selectionTtlSeconds|
|editEnabled|boolean|false|none||none|
|maxEdits|integer|false|none||none|

