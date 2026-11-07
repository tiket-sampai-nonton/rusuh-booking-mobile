---
title: 4. Payment Service API
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

# 4. Payment Service API

Halaman bayar, attempt Midtrans, webhook. Agregat Payment Attempt memakai event sourcing (ADR-019).

Base URLs:

# Authentication

* API Key (visitorCookie2)
    - Parameter Name: **rb_visitor**, in: cookie. Visitor token web (HttpOnly, Secure, SameSite=Lax)

* API Key (visitorHeader2)
    - Parameter Name: **X-Visitor-Token**, in: header. Visitor token mobile (secure storage)

* API Key (paymentPageCookie)
    - Parameter Name: **rb_pay**, in: cookie. Cookie payment page hasil tukar token WebView

* API Key (midtransSignature)
    - Parameter Name: **X-Signature-Key-Body**, in: header. Signature diverifikasi dari field signature_key body (SHA-512)

# payment

<a id="opIdgetPaymentPage"></a>

## GET View model halaman bayar (web dan WebView)

GET /api/v1/payments/{bookingId}/page

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
    "methods": [
      "VA_BCA"
    ],
    "amountMinor": 0,
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "serverTime": "2019-08-24T14:15:22Z",
    "currentAttempt": {
      "attemptNo": 0,
      "method": "string",
      "status": "CREATED",
      "bookingVersion": 0,
      "expiresAt": "2019-08-24T14:15:22Z",
      "redirectUrl": "http://example.com",
      "successReturnUrl": "http://example.com",
      "failedReturnUrl": "http://example.com"
    },
    "canEdit": true,
    "editableUntil": "2019-08-24T14:15:22Z"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Booking tidak menunggu pembayaran — errorCode: `BOOKING_NOT_PAYABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[PaymentPage](#schemapaymentpage)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» methods|[string]|true|none||none|
|»» amountMinor|integer(int64)|true|none||Minor unit IDR|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» serverTime|string(date-time)|true|none||none|
|»» currentAttempt|[Attempt](#schemaattempt)¦null|false|none||Attempt yang bisa dibuka FE (PENDING, punya redirectUrl). null bila belum ada atau bila attempt terbuka masih CREATED/UNKNOWN; FE lalu membuat attempt baru dan BE merekonsiliasi order lama ke Midtrans lebih dulu.|
|»»» attemptNo|integer|true|none||none|
|»»» method|string|true|none||none|
|»»» status|string|true|none||none|
|»»» bookingVersion|integer|true|none||none|
|»»» expiresAt|string(date-time)|false|none||none|
|»»» redirectUrl|string(uri)|false|none||URL halaman Midtrans SNAP yang dibuka FE (redirect/WebView). Ada setelah attempt PENDING. Token SNAP tidak dikirim terpisah.|
|»»» successReturnUrl|string(uri)|false|none||Halaman FE tujuan SNAP setelah alur bayar selesai. Wajib memverifikasi GET /payments/{bookingId}/status sebelum menampilkan hasil.|
|»»» failedReturnUrl|string(uri)|false|none||Halaman FE untuk pembayaran gagal atau dibatalkan. Juga wajib memverifikasi status ke backend.|
|»» canEdit|boolean|true|none||none|
|»» editableUntil|string(date-time)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|status|CREATED|
|status|PENDING|
|status|UNKNOWN|
|status|SUCCEEDED|
|status|FAILED|
|status|CANCELLED|
|status|EXPIRED|
|status|REFUND_REQUIRED|
|status|REFUNDED|

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

<a id="opIdcreatePageToken"></a>

## POST Token sekali pakai untuk WebView mobile

POST /api/v1/payments/{bookingId}/page-tokens

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|

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
    "pageToken": "string",
    "pageUrl": "string",
    "expiresAt": "2019-08-24T14:15:22Z"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Booking tidak menunggu pembayaran — errorCode: `BOOKING_NOT_PAYABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[PageToken](#schemapagetoken)|true|none||none|
|»» pageToken|string|true|none||Sekali pakai, TTL PAYMENT_PAGE_TOKEN_TTL_SECONDS|
|»» pageUrl|string|true|none||none|
|»» expiresAt|string(date-time)|true|none||none|

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

<a id="opIdexchangePageToken"></a>

## POST Tukar token WebView menjadi cookie payment page

POST /api/v1/payment-page-sessions

> Body Parameters

```json
{
  "pageToken": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[PageSessionRequest](#schemapagesessionrequest)| yes |none|

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
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Cookie rb_pay diset|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Token salah/kedaluwarsa — errorCode: `PAYMENT_PAGE_TOKEN_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|

<a id="opIdcreateAttempt"></a>

## POST Buat atau rekonsiliasi attempt (memanggil payment-lock dulu)

POST /api/v1/payments/{bookingId}/attempts

> Body Parameters

```json
{
  "method": "VA_BCA"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|
|Idempotency-Key|header|string| yes |Unik per tombol; retry memakai key yang sama (SRS §3.2.24)|
|body|body|[CreateAttemptRequest](#schemacreateattemptrequest)| yes |none|

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
    "attemptNo": 0,
    "method": "string",
    "status": "CREATED",
    "bookingVersion": 0,
    "expiresAt": "2019-08-24T14:15:22Z",
    "redirectUrl": "http://example.com",
    "successReturnUrl": "http://example.com",
    "failedReturnUrl": "http://example.com"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Konflik — errorCode: `BOOKING_NOT_PAYABLE`, `IDEMPOTENCY_KEY_REUSED`|[ErrorEnvelope](#schemaerrorenvelope)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Metode tidak aktif — errorCode: `PAYMENT_METHOD_UNAVAILABLE`|[ErrorEnvelope](#schemaerrorenvelope)|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Gateway gangguan — errorCode: `PAYMENT_PROVIDER_UNAVAILABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[Attempt](#schemaattempt)|true|none||none|
|»» attemptNo|integer|true|none||none|
|»» method|string|true|none||none|
|»» status|string|true|none||none|
|»» bookingVersion|integer|true|none||none|
|»» expiresAt|string(date-time)|false|none||none|
|»» redirectUrl|string(uri)|false|none||URL halaman Midtrans SNAP yang dibuka FE (redirect/WebView). Ada setelah attempt PENDING. Token SNAP tidak dikirim terpisah.|
|»» successReturnUrl|string(uri)|false|none||Halaman FE tujuan SNAP setelah alur bayar selesai. Wajib memverifikasi GET /payments/{bookingId}/status sebelum menampilkan hasil.|
|»» failedReturnUrl|string(uri)|false|none||Halaman FE untuk pembayaran gagal atau dibatalkan. Juga wajib memverifikasi status ke backend.|

#### Enum

|Name|Value|
|---|---|
|status|CREATED|
|status|PENDING|
|status|UNKNOWN|
|status|SUCCEEDED|
|status|FAILED|
|status|CANCELLED|
|status|EXPIRED|
|status|REFUND_REQUIRED|
|status|REFUNDED|

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

<a id="opIdgetPaymentStatus"></a>

## GET Status attempt dan instruksi

GET /api/v1/payments/{bookingId}/status

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
    "bookingStatus": "string",
    "orderId": "string",
    "paymentExpiresAt": "2019-08-24T14:15:22Z",
    "attempt": {
      "attemptNo": 0,
      "method": "string",
      "status": "CREATED",
      "bookingVersion": 0,
      "expiresAt": "2019-08-24T14:15:22Z",
      "redirectUrl": "http://example.com",
      "successReturnUrl": "http://example.com",
      "failedReturnUrl": "http://example.com"
    },
    "serverTime": "2019-08-24T14:15:22Z"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Tidak ada atau bukan milik pemanggil — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[PaymentStatus](#schemapaymentstatus)|true|none||none|
|»» bookingId|string(uuid)|true|none||none|
|»» bookingStatus|string|true|none||none|
|»» orderId|string|false|none||Referensi publik booking (publicRef).|
|»» paymentExpiresAt|string(date-time)|true|none||none|
|»» attempt|[Attempt](#schemaattempt)¦null|false|none||none|
|»»» attemptNo|integer|true|none||none|
|»»» method|string|true|none||none|
|»»» status|string|true|none||none|
|»»» bookingVersion|integer|true|none||none|
|»»» expiresAt|string(date-time)|false|none||none|
|»»» redirectUrl|string(uri)|false|none||URL halaman Midtrans SNAP yang dibuka FE (redirect/WebView). Ada setelah attempt PENDING. Token SNAP tidak dikirim terpisah.|
|»»» successReturnUrl|string(uri)|false|none||Halaman FE tujuan SNAP setelah alur bayar selesai. Wajib memverifikasi GET /payments/{bookingId}/status sebelum menampilkan hasil.|
|»»» failedReturnUrl|string(uri)|false|none||Halaman FE untuk pembayaran gagal atau dibatalkan. Juga wajib memverifikasi status ke backend.|
|»» serverTime|string(date-time)|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|CREATED|
|status|PENDING|
|status|UNKNOWN|
|status|SUCCEEDED|
|status|FAILED|
|status|CANCELLED|
|status|EXPIRED|
|status|REFUND_REQUIRED|
|status|REFUNDED|

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

# webhook

<a id="opIdmidtransWebhook"></a>

## POST HTTP notification Midtrans (idempoten, out-of-order aman)

POST /api/v1/webhooks/midtrans

> Body Parameters

```json
{
  "order_id": "string",
  "transaction_status": "string",
  "status_code": "string",
  "gross_amount": "string",
  "signature_key": "string",
  "transaction_id": "string",
  "settlement_time": "string",
  "fraud_status": "string",
  "payment_type": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[MidtransNotification](#schemamidtransnotification)| yes |none|

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
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tersimpan durable (payment_callbacks) sebelum 2xx|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Signature salah — errorCode: `WEBHOOK_SIGNATURE_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|

# simulator

<a id="opIdsimulatePayment"></a>

## POST Simulasi gateway (hanya APP_ENV=local atau ci)

POST /api/v1/local-simulator/payments/{attemptId}/scenario

> Body Parameters

```json
{
  "scenario": "SETTLE"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|attemptId|path|string(uuid)| yes |none|
|body|body|[SimulatorScenario](#schemasimulatorscenario)| yes |none|

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
|202|[Accepted](https://tools.ietf.org/html/rfc7231#section-6.3.3)|Skenario dijalankan|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token visitor tidak valid atau kedaluwarsa — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Simulator mati di lingkungan ini — errorCode: `NOT_FOUND`|[ErrorEnvelope](#schemaerrorenvelope)|

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

<h2 id="tocS_PaymentPage">PaymentPage</h2>

<a id="schemapaymentpage"></a>
<a id="schema_PaymentPage"></a>
<a id="tocSpaymentpage"></a>
<a id="tocspaymentpage"></a>

```json
{
  "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
  "methods": [
    "VA_BCA"
  ],
  "amountMinor": 0,
  "paymentExpiresAt": "2019-08-24T14:15:22Z",
  "serverTime": "2019-08-24T14:15:22Z",
  "currentAttempt": {
    "attemptNo": 0,
    "method": "string",
    "status": "CREATED",
    "bookingVersion": 0,
    "expiresAt": "2019-08-24T14:15:22Z",
    "redirectUrl": "http://example.com",
    "successReturnUrl": "http://example.com",
    "failedReturnUrl": "http://example.com"
  },
  "canEdit": true,
  "editableUntil": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bookingId|string(uuid)|true|none||none|
|methods|[string]|true|none||none|
|amountMinor|integer(int64)|true|none||Minor unit IDR|
|paymentExpiresAt|string(date-time)|true|none||none|
|serverTime|string(date-time)|true|none||none|
|currentAttempt|[Attempt](#schemaattempt)|false|none||Attempt yang bisa dibuka FE (PENDING, punya redirectUrl). null bila belum ada atau bila attempt terbuka masih CREATED/UNKNOWN; FE lalu membuat attempt baru dan BE merekonsiliasi order lama ke Midtrans lebih dulu.|
|canEdit|boolean|true|none||none|
|editableUntil|string(date-time)|false|none||none|

<h2 id="tocS_PageToken">PageToken</h2>

<a id="schemapagetoken"></a>
<a id="schema_PageToken"></a>
<a id="tocSpagetoken"></a>
<a id="tocspagetoken"></a>

```json
{
  "pageToken": "string",
  "pageUrl": "string",
  "expiresAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|pageToken|string|true|none||Sekali pakai, TTL PAYMENT_PAGE_TOKEN_TTL_SECONDS|
|pageUrl|string|true|none||none|
|expiresAt|string(date-time)|true|none||none|

<h2 id="tocS_PageSessionRequest">PageSessionRequest</h2>

<a id="schemapagesessionrequest"></a>
<a id="schema_PageSessionRequest"></a>
<a id="tocSpagesessionrequest"></a>
<a id="tocspagesessionrequest"></a>

```json
{
  "pageToken": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|pageToken|string|true|none||none|

<h2 id="tocS_CreateAttemptRequest">CreateAttemptRequest</h2>

<a id="schemacreateattemptrequest"></a>
<a id="schema_CreateAttemptRequest"></a>
<a id="tocScreateattemptrequest"></a>
<a id="tocscreateattemptrequest"></a>

```json
{
  "method": "VA_BCA"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|method|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|method|VA_BCA|
|method|VA_BNI|
|method|VA_BRI|
|method|VA_PERMATA|
|method|QRIS|
|method|GOPAY|
|method|SNAP|

<h2 id="tocS_Attempt">Attempt</h2>

<a id="schemaattempt"></a>
<a id="schema_Attempt"></a>
<a id="tocSattempt"></a>
<a id="tocsattempt"></a>

```json
{
  "attemptNo": 0,
  "method": "string",
  "status": "CREATED",
  "bookingVersion": 0,
  "expiresAt": "2019-08-24T14:15:22Z",
  "redirectUrl": "http://example.com",
  "successReturnUrl": "http://example.com",
  "failedReturnUrl": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|attemptNo|integer|true|none||none|
|method|string|true|none||none|
|status|string|true|none||none|
|bookingVersion|integer|true|none||none|
|expiresAt|string(date-time)|false|none||none|
|redirectUrl|string(uri)|false|none||URL halaman Midtrans SNAP yang dibuka FE (redirect/WebView). Ada setelah attempt PENDING. Token SNAP tidak dikirim terpisah.|
|successReturnUrl|string(uri)|false|none||Halaman FE tujuan SNAP setelah alur bayar selesai. Wajib memverifikasi GET /payments/{bookingId}/status sebelum menampilkan hasil.|
|failedReturnUrl|string(uri)|false|none||Halaman FE untuk pembayaran gagal atau dibatalkan. Juga wajib memverifikasi status ke backend.|

#### Enum

|Name|Value|
|---|---|
|status|CREATED|
|status|PENDING|
|status|UNKNOWN|
|status|SUCCEEDED|
|status|FAILED|
|status|CANCELLED|
|status|EXPIRED|
|status|REFUND_REQUIRED|
|status|REFUNDED|

<h2 id="tocS_PaymentStatus">PaymentStatus</h2>

<a id="schemapaymentstatus"></a>
<a id="schema_PaymentStatus"></a>
<a id="tocSpaymentstatus"></a>
<a id="tocspaymentstatus"></a>

```json
{
  "bookingId": "9a471128-954e-4e64-bde9-e8147015df89",
  "bookingStatus": "string",
  "orderId": "string",
  "paymentExpiresAt": "2019-08-24T14:15:22Z",
  "attempt": {
    "attemptNo": 0,
    "method": "string",
    "status": "CREATED",
    "bookingVersion": 0,
    "expiresAt": "2019-08-24T14:15:22Z",
    "redirectUrl": "http://example.com",
    "successReturnUrl": "http://example.com",
    "failedReturnUrl": "http://example.com"
  },
  "serverTime": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bookingId|string(uuid)|true|none||none|
|bookingStatus|string|true|none||none|
|orderId|string|false|none||Referensi publik booking (publicRef).|
|paymentExpiresAt|string(date-time)|true|none||none|
|attempt|[Attempt](#schemaattempt)|false|none||none|
|serverTime|string(date-time)|true|none||none|

<h2 id="tocS_MidtransNotification">MidtransNotification</h2>

<a id="schemamidtransnotification"></a>
<a id="schema_MidtransNotification"></a>
<a id="tocSmidtransnotification"></a>
<a id="tocsmidtransnotification"></a>

```json
{
  "order_id": "string",
  "transaction_status": "string",
  "status_code": "string",
  "gross_amount": "string",
  "signature_key": "string",
  "transaction_id": "string",
  "settlement_time": "string",
  "fraud_status": "string",
  "payment_type": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|order_id|string|true|none||none|
|transaction_status|string|true|none||none|
|status_code|string|true|none||none|
|gross_amount|string|true|none||none|
|signature_key|string|true|none||none|
|transaction_id|string|false|none||none|
|settlement_time|string|false|none||none|
|fraud_status|string|false|none||none|
|payment_type|string|false|none||none|

<h2 id="tocS_SimulatorScenario">SimulatorScenario</h2>

<a id="schemasimulatorscenario"></a>
<a id="schema_SimulatorScenario"></a>
<a id="tocSsimulatorscenario"></a>
<a id="tocssimulatorscenario"></a>

```json
{
  "scenario": "SETTLE"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|scenario|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|scenario|SETTLE|
|scenario|SETTLE_LATE|
|scenario|EXPIRE|
|scenario|DENY|
|scenario|TIMEOUT|
|scenario|DUPLICATE_WEBHOOK|
|scenario|OUT_OF_ORDER|

