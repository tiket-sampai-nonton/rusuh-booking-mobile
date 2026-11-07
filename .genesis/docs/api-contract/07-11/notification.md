---
title: 5. Notification Service API
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

# 5. Notification Service API

Push subscription mobile. Email dikirim dari event (docs/contracts/events).

Base URLs:

# Authentication

* API Key (visitorHeader3)
    - Parameter Name: **X-Visitor-Token**, in: header. Visitor token mobile (secure storage)

# notification

<a id="opIdregisterPush"></a>

## POST Daftarkan token push untuk event (mobile, opsional)

POST /api/v1/push-subscriptions

> Body Parameters

```json
{
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "platform": "ANDROID",
  "pushToken": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[PushSubscription](#schemapushsubscription)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Tersimpan terenkripsi; dihapus saat penjualan berakhir|None|

<a id="opIddeletePush"></a>

## DELETE Hapus token push

DELETE /api/v1/push-subscriptions/{eventId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|eventId|path|string(uuid)| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Dihapus|None|

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

<h2 id="tocS_PushSubscription">PushSubscription</h2>

<a id="schemapushsubscription"></a>
<a id="schema_PushSubscription"></a>
<a id="tocSpushsubscription"></a>
<a id="tocspushsubscription"></a>

```json
{
  "eventId": "d6703cc8-9e79-415d-ac03-a4dc7f6ab43c",
  "platform": "ANDROID",
  "pushToken": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|eventId|string(uuid)|true|none||none|
|platform|string|true|none||none|
|pushToken|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|platform|ANDROID|
|platform|IOS|
|platform|WEB|

