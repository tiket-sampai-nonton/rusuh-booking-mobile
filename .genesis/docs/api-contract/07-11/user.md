---
title: 1. User Service API
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

# 1. User Service API

Akun opsional (ADR-020): login OTP email tanpa password, rotasi refresh token, profil. Guest checkout tidak membutuhkan service ini.

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer<br/>Access token User Service (login OTP, opsional).
Token claims (SRS-F-27-10, PRD v5.4):
- sub: account UUID
- email: email akun
- nik_hash: HMAC-SHA256 dari NIK (null jika belum tersimpan)
- has_nik: boolean (true jika NIK tersimpan)
Queue Service gunakan nik_hash langsung saat has_nik=true.

# auth

<a id="opIdrequestOtp"></a>

## POST Kirim kode OTP 6 digit ke email

POST /api/v1/auth/otp/request

Respons sama untuk email terdaftar maupun belum (anti enumerasi). Batas: OTP_MAX_PER_EMAIL_HOUR per email, OTP_MAX_PER_IP_HOUR per IP, cooldown OTP_RESEND_COOLDOWN.

> Body Parameters

```json
{
  "email": "user@example.com"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RequestOTPRequest](#schemarequestotprequest)| yes |none|

> Response Examples

> 202 Response

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
    "expiresInSeconds": 0,
    "resendAfterSeconds": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|202|[Accepted](https://tools.ietf.org/html/rfc7231#section-6.3.3)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Field tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Terlalu sering — errorCode: `OTP_RESEND_TOO_SOON`, `RATE_LIMITED`|[ErrorEnvelope](#schemaerrorenvelope)|
|503|[Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4)|Email belum bisa dikirim — errorCode: `DEPENDENCY_UNAVAILABLE`|[ErrorEnvelope](#schemaerrorenvelope)|

### Responses Data Schema

HTTP Status Code **202**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||Pada error berformat "KODE: pesan" (KODE dari daftar SRS §3.1.4 Error Codes); error internal memakai pesan umum.|
|»» requestId|string|false|none||Hanya pada respons sukses. Pada error, requestId dikirim di header X-Request-ID.|
|»» errorCode|string|false|none||Tidak lagi dikirim (platform R2.8). Kode error ada di awalan meta.message.|
|»» details|object|false|none||Tidak lagi dikirim (platform R2.8). Detail hanya ditulis ke log.|
|»»» **additionalProperties**|string|false|none||none|
|» data|[RequestOTPResponse](#schemarequestotpresponse)|true|none||none|
|»» expiresInSeconds|integer|true|none||none|
|»» resendAfterSeconds|integer|true|none||none|

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

<a id="opIdverifyOtp"></a>

## POST Tukar kode OTP dengan token; akun dibuat saat login pertama

POST /api/v1/auth/otp/verify

> Body Parameters

```json
{
  "email": "user@example.com",
  "code": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[VerifyOTPRequest](#schemaverifyotprequest)| yes |none|

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
    "tokenType": "Bearer",
    "accessToken": "string",
    "accessTokenExpiresAt": "2019-08-24T14:15:22Z",
    "refreshToken": "string",
    "refreshTokenExpiresAt": "2019-08-24T14:15:22Z",
    "account": {
      "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
      "emailMasked": "string",
      "fullName": "string",
      "nikMasked": "3174********0001",
      "hasNik": true
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Field tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Kode salah/kedaluwarsa (details.attemptsLeft) — errorCode: `OTP_INVALID`, `OTP_EXPIRED`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Akun dinonaktifkan — errorCode: `ACCOUNT_DISABLED`|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Terlalu banyak percobaan atau permintaan — errorCode: `OTP_LOCKED`, `RATE_LIMITED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[TokenResponse](#schematokenresponse)|true|none||none|
|»» tokenType|string|true|none||none|
|»» accessToken|string|true|none||none|
|»» accessTokenExpiresAt|string(date-time)|true|none||none|
|»» refreshToken|string|true|none||none|
|»» refreshTokenExpiresAt|string(date-time)|true|none||none|
|»» account|[Profile](#schemaprofile)|true|none||none|
|»»» accountId|string(uuid)|true|none||none|
|»»» emailMasked|string|true|none||none|
|»»» fullName|string|false|none||none|
|»»» nikMasked|string|false|none||NIK tersamar|
|»»» hasNik|boolean|true|none||none|

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

<a id="opIdrefreshToken"></a>

## POST Rotasi refresh token

POST /api/v1/auth/refresh

Refresh token lama langsung dicabut. Token lama yang dipakai ulang mencabut semua sesi akun (deteksi pencurian).

> Body Parameters

```json
{
  "refreshToken": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RefreshRequest](#schemarefreshrequest)| yes |none|

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
    "tokenType": "Bearer",
    "accessToken": "string",
    "accessTokenExpiresAt": "2019-08-24T14:15:22Z",
    "refreshToken": "string",
    "refreshTokenExpiresAt": "2019-08-24T14:15:22Z",
    "account": {
      "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
      "emailMasked": "string",
      "fullName": "string",
      "nikMasked": "3174********0001",
      "hasNik": true
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Sesi tidak valid — errorCode: `SESSION_INVALID`|[ErrorEnvelope](#schemaerrorenvelope)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Akun dinonaktifkan — errorCode: `ACCOUNT_DISABLED`|[ErrorEnvelope](#schemaerrorenvelope)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Terlalu banyak permintaan dari IP ini — errorCode: `RATE_LIMITED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[TokenResponse](#schematokenresponse)|true|none||none|
|»» tokenType|string|true|none||none|
|»» accessToken|string|true|none||none|
|»» accessTokenExpiresAt|string(date-time)|true|none||none|
|»» refreshToken|string|true|none||none|
|»» refreshTokenExpiresAt|string(date-time)|true|none||none|
|»» account|[Profile](#schemaprofile)|true|none||none|
|»»» accountId|string(uuid)|true|none||none|
|»»» emailMasked|string|true|none||none|
|»»» fullName|string|false|none||none|
|»»» nikMasked|string|false|none||NIK tersamar|
|»»» hasNik|boolean|true|none||none|

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

<a id="opIdlogout"></a>

## POST Cabut sesi (idempoten)

POST /api/v1/auth/logout

Mencabut sesi refresh dan access token sesi itu: access token berhenti diterima di User, Booking (admin dan pembeli), dan Queue segera setelah logout, tidak menunggu exp. Berlaku untuk token yang memuat klaim `sid`; token yang terbit sebelum fitur ini tetap berlaku sampai exp. Access token yang diterbitkan sebelum refresh terakhir memakai `sid` sesi sebelumnya dan tidak ikut dicabut (umurnya paling lama TOKEN_ACCESS_TTL). Bila denylist (Valkey) gagal ditulis, jawabannya 500 dan klien boleh mengulang.

> Body Parameters

```json
{
  "refreshToken": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RefreshRequest](#schemarefreshrequest)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Sesi dicabut (atau memang tidak ada)|None|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Terlalu banyak permintaan dari IP ini — errorCode: `RATE_LIMITED`|None|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Denylist tidak bisa ditulis (sesi refresh sudah dicabut); ulangi — errorCode: `INTERNAL_ERROR`|None|

# profile

<a id="opIdgetMe"></a>

## GET Profil pembeli yang login

GET /api/v1/me

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
    "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
    "emailMasked": "string",
    "fullName": "string",
    "nikMasked": "3174********0001",
    "hasNik": true
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
|» data|[Profile](#schemaprofile)|true|none||none|
|»» accountId|string(uuid)|true|none||none|
|»» emailMasked|string|true|none||none|
|»» fullName|string|false|none||none|
|»» nikMasked|string|false|none||NIK tersamar|
|»» hasNik|boolean|true|none||none|

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

<a id="opIdupdateMe"></a>

## PATCH Ubah nama dan/atau NIK tersimpan

PATCH /api/v1/me

NIK disimpan terenkripsi (AES-256-GCM) dan unik antar akun; respons hanya memuat NIK tersamar.

> Body Parameters

```json
{
  "fullName": "string",
  "nik": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdateProfileRequest](#schemaupdateprofilerequest)| yes |none|

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
    "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
    "emailMasked": "string",
    "fullName": "string",
    "nikMasked": "3174********0001",
    "hasNik": true
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Field tidak valid — errorCode: `VALIDATION_ERROR`|[ErrorEnvelope](#schemaerrorenvelope)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Access token tidak valid — errorCode: `UNAUTHORIZED`|[ErrorEnvelope](#schemaerrorenvelope)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|NIK sudah tertaut ke akun lain — errorCode: `NIK_ALREADY_LINKED`|[ErrorEnvelope](#schemaerrorenvelope)|

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
|» data|[Profile](#schemaprofile)|true|none||none|
|»» accountId|string(uuid)|true|none||none|
|»» emailMasked|string|true|none||none|
|»» fullName|string|false|none||none|
|»» nikMasked|string|false|none||NIK tersamar|
|»» hasNik|boolean|true|none||none|

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

<h2 id="tocS_RequestOTPRequest">RequestOTPRequest</h2>

<a id="schemarequestotprequest"></a>
<a id="schema_RequestOTPRequest"></a>
<a id="tocSrequestotprequest"></a>
<a id="tocsrequestotprequest"></a>

```json
{
  "email": "user@example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string(email)|true|none||none|

<h2 id="tocS_RequestOTPResponse">RequestOTPResponse</h2>

<a id="schemarequestotpresponse"></a>
<a id="schema_RequestOTPResponse"></a>
<a id="tocSrequestotpresponse"></a>
<a id="tocsrequestotpresponse"></a>

```json
{
  "expiresInSeconds": 0,
  "resendAfterSeconds": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|expiresInSeconds|integer|true|none||none|
|resendAfterSeconds|integer|true|none||none|

<h2 id="tocS_VerifyOTPRequest">VerifyOTPRequest</h2>

<a id="schemaverifyotprequest"></a>
<a id="schema_VerifyOTPRequest"></a>
<a id="tocSverifyotprequest"></a>
<a id="tocsverifyotprequest"></a>

```json
{
  "email": "user@example.com",
  "code": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string(email)|true|none||none|
|code|string|true|none||none|

<h2 id="tocS_RefreshRequest">RefreshRequest</h2>

<a id="schemarefreshrequest"></a>
<a id="schema_RefreshRequest"></a>
<a id="tocSrefreshrequest"></a>
<a id="tocsrefreshrequest"></a>

```json
{
  "refreshToken": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|refreshToken|string|true|none||none|

<h2 id="tocS_Profile">Profile</h2>

<a id="schemaprofile"></a>
<a id="schema_Profile"></a>
<a id="tocSprofile"></a>
<a id="tocsprofile"></a>

```json
{
  "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
  "emailMasked": "string",
  "fullName": "string",
  "nikMasked": "3174********0001",
  "hasNik": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|accountId|string(uuid)|true|none||none|
|emailMasked|string|true|none||none|
|fullName|string|false|none||none|
|nikMasked|string|false|none||NIK tersamar|
|hasNik|boolean|true|none||none|

<h2 id="tocS_TokenResponse">TokenResponse</h2>

<a id="schematokenresponse"></a>
<a id="schema_TokenResponse"></a>
<a id="tocStokenresponse"></a>
<a id="tocstokenresponse"></a>

```json
{
  "tokenType": "Bearer",
  "accessToken": "string",
  "accessTokenExpiresAt": "2019-08-24T14:15:22Z",
  "refreshToken": "string",
  "refreshTokenExpiresAt": "2019-08-24T14:15:22Z",
  "account": {
    "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
    "emailMasked": "string",
    "fullName": "string",
    "nikMasked": "3174********0001",
    "hasNik": true
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|tokenType|string|true|none||none|
|accessToken|string|true|none||none|
|accessTokenExpiresAt|string(date-time)|true|none||none|
|refreshToken|string|true|none||none|
|refreshTokenExpiresAt|string(date-time)|true|none||none|
|account|[Profile](#schemaprofile)|true|none||none|

<h2 id="tocS_UpdateProfileRequest">UpdateProfileRequest</h2>

<a id="schemaupdateprofilerequest"></a>
<a id="schema_UpdateProfileRequest"></a>
<a id="tocSupdateprofilerequest"></a>
<a id="tocsupdateprofilerequest"></a>

```json
{
  "fullName": "string",
  "nik": "string"
}

```

Field yang tidak dikirim tidak diubah; minimal satu field

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|fullName|string|false|none||none|
|nik|string|false|none||NIK 16 digit (dicek strukturnya; tidak pernah disimpan plaintext)|

