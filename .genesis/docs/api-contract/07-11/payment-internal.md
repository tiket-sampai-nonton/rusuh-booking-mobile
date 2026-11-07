---
title: Payment Internal API
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

# Payment Internal API

Dipanggil worker Booking. Selalu `Authorization: Bearer <service token>`.

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer<br/>Service token antar service (ADR-011)

# internal

<a id="opIdresolvePayment"></a>

## POST Cek ulang ke gateway sebelum expire (dipanggil sweeper Booking)

POST /internal/v1/payments/{bookingId}/resolve

> Body Parameters

```json
{
  "mode": "CHECK"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|bookingId|path|string(uuid)| yes |none|
|body|body|[ResolveRequest](#schemaresolverequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "meta": {
    "code": 0,
    "message": "string"
  },
  "data": {
    "outcome": "SUCCEEDED",
    "settlementTime": "2019-08-24T14:15:22Z",
    "attemptId": "ff88f33b-bb8d-4c28-947a-07ff3d628b10"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» meta|[Meta](#schemameta)|true|none||none|
|»» code|integer|true|none||none|
|»» message|string|false|none||none|
|» data|[ResolveResponse](#schemaresolveresponse)|true|none||none|
|»» outcome|string|true|none||none|
|»» settlementTime|string(date-time)|false|none||none|
|»» attemptId|string(uuid)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|outcome|SUCCEEDED|
|outcome|NOT_PAID|
|outcome|NO_ATTEMPT|
|outcome|UNKNOWN|

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
  "message": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|code|integer|true|none||none|
|message|string|false|none||none|

<h2 id="tocS_ErrorEnvelope">ErrorEnvelope</h2>

<a id="schemaerrorenvelope"></a>
<a id="schema_ErrorEnvelope"></a>
<a id="tocSerrorenvelope"></a>
<a id="tocserrorenvelope"></a>

```json
{
  "meta": {
    "code": 0,
    "message": "string"
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

<h2 id="tocS_ResolveRequest">ResolveRequest</h2>

<a id="schemaresolverequest"></a>
<a id="schema_ResolveRequest"></a>
<a id="tocSresolverequest"></a>
<a id="tocsresolverequest"></a>

```json
{
  "mode": "CHECK"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|mode|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|mode|CHECK|
|mode|CHECK_AND_CANCEL|

<h2 id="tocS_ResolveResponse">ResolveResponse</h2>

<a id="schemaresolveresponse"></a>
<a id="schema_ResolveResponse"></a>
<a id="tocSresolveresponse"></a>
<a id="tocsresolveresponse"></a>

```json
{
  "outcome": "SUCCEEDED",
  "settlementTime": "2019-08-24T14:15:22Z",
  "attemptId": "ff88f33b-bb8d-4c28-947a-07ff3d628b10"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|outcome|string|true|none||none|
|settlementTime|string(date-time)|false|none||none|
|attemptId|string(uuid)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|outcome|SUCCEEDED|
|outcome|NOT_PAID|
|outcome|NO_ATTEMPT|
|outcome|UNKNOWN|

